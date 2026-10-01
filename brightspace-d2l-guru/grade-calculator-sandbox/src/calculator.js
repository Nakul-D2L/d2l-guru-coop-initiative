// Pure, client side calculation engine for the grade calculator sandbox prototype.
// No network calls, no writes: everything here is synchronous math over a gradebook snapshot,
// so the risky part of the feature (the math) can be tested in isolation from any UI.

const FULL_PERCENTAGE = 100;

function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}

// A scored item always wins over a hypothetical: nothing can edit a locked item, even here.
function getEffectiveScore(item, overrides) {
	if (item.score !== null) return item.score;
	const override = overrides[item.id];
	return isFiniteNumber(override) ? override : null;
}

function calculateCategoryPercentage(category, overrides) {
	const countable = category.items.filter(item => !item.isExempt);

	const regularEntries = [];
	const bonusScores = [];

	for (const item of countable) {
		// A missing possible-points value can never be computed, hypothetical or not.
		if (!item.isBonus && !isFiniteNumber(item.pointsPossible)) {
			return { percentage: null, supported: false };
		}

		const effectiveScore = getEffectiveScore(item, overrides);
		// Ungraded with no hypothetical entered yet: excluded, same as the real running grade today.
		if (effectiveScore === null) continue;

		if (item.isBonus) {
			bonusScores.push(effectiveScore);
			continue;
		}

		const itemPercentage = (effectiveScore / item.pointsPossible) * FULL_PERCENTAGE;
		regularEntries.push({ item, effectiveScore, itemPercentage });
	}

	if (regularEntries.length === 0) return { percentage: null, supported: false };

	const dropCount = Math.min(category.dropLowest || 0, regularEntries.length - 1);
	const sortedByPercentage = [...regularEntries].sort((a, b) => a.itemPercentage - b.itemPercentage);
	const droppedIds = new Set(sortedByPercentage.slice(0, dropCount).map(entry => entry.item.id));
	const counted = regularEntries.filter(entry => !droppedIds.has(entry.item.id));

	if (counted.length === 0) return { percentage: null, supported: false };

	const earnedPoints = counted.reduce((sum, entry) => sum + entry.effectiveScore, 0);
	const possiblePoints = counted.reduce((sum, entry) => sum + entry.item.pointsPossible, 0);
	const bonusPoints = bonusScores.reduce((sum, score) => sum + score, 0);

	// Bonus points add to the numerator only, which is what lets a category clear its own weight.
	return { percentage: ((earnedPoints + bonusPoints) / possiblePoints) * FULL_PERCENTAGE, supported: true };
}

export function calculateFinalGrade(gradebook, hypotheticalScores = {}) {
	const categories = gradebook?.categories || [];
	// Reported alongside the grade: a course missing whole categories (not yet posted) still normalizes
	// against only what is here, so callers can tell the student this isn't the full course weight yet.
	const totalWeight = categories.reduce((sum, category) => sum + category.weight, 0);
	if (totalWeight <= 0) return { grade: null, supported: false, totalWeight };

	let weightedTotal = 0;
	for (const category of categories) {
		const { percentage, supported } = calculateCategoryPercentage(category, hypotheticalScores);
		if (!supported) return { grade: null, supported: false, totalWeight };
		// Normalizing against the actual weight sum handles grade books where weights don't add to 100.
		weightedTotal += percentage * (category.weight / totalWeight);
	}

	return { grade: weightedTotal, supported: true, totalWeight };
}

// A display-only comparison, never a real policy override: lets a student see their grade with the
// teacher's configured drop-lowest applied versus not, so the drop's effect is verifiable, not just trusted.
export function withoutDroppedLowest(gradebook) {
	const categories = gradebook?.categories || [];
	return { categories: categories.map(category => ({ ...category, dropLowest: 0 })) };
}

function getEditableItems(categories) {
	const editable = [];
	for (const category of categories) {
		// Which item ends up "lowest" can change as hypotheticals change, so drop-lowest categories
		// aren't solved for a target yet; skip their items rather than guess.
		if ((category.dropLowest || 0) > 0) continue;
		for (const item of category.items) {
			if (item.score === null && !item.isExempt && !item.isBonus) editable.push(item);
		}
	}
	return editable;
}

export function solveForTarget(gradebook, targetGrade, pinnedScores = {}) {
	if (!isFiniteNumber(targetGrade)) {
		return { achievable: false, supported: false, reason: 'Target grade must be a number.' };
	}

	const categories = gradebook?.categories || [];
	const hasUnsupportedDrop = categories.some(category => (category.dropLowest || 0) > 0 &&
		category.items.some(item => item.score === null && !item.isExempt && !item.isBonus));
	if (hasUnsupportedDrop) {
		return { achievable: false, supported: false, reason: 'Reverse mode does not yet support a category with a dropped lowest score.' };
	}

	const editableItems = getEditableItems(categories).filter(item => !isFiniteNumber(pinnedScores[item.id]));

	if (editableItems.length === 0) {
		const { grade, supported } = calculateFinalGrade(gradebook, pinnedScores);
		if (!supported) return { achievable: false, supported: false, reason: 'Grade book configuration is not fully supported.' };
		return { achievable: grade === targetGrade, supported: true, scores: {} };
	}

	const scoresAtFraction = fraction => {
		const overrides = { ...pinnedScores };
		for (const item of editableItems) overrides[item.id] = fraction * item.pointsPossible;
		return overrides;
	};

	const atZero = calculateFinalGrade(gradebook, scoresAtFraction(0));
	const atOne = calculateFinalGrade(gradebook, scoresAtFraction(1));
	if (!atZero.supported || !atOne.supported) {
		return { achievable: false, supported: false, reason: 'Grade book configuration is not fully supported.' };
	}

	if (atOne.grade === atZero.grade) {
		return { achievable: atZero.grade === targetGrade, supported: true, scores: {} };
	}

	// The final grade is linear in a uniform fraction applied to the remaining items,
	// so two sample points are enough to solve for the fraction that hits the target.
	const fraction = (targetGrade - atZero.grade) / (atOne.grade - atZero.grade);
	if (fraction < 0 || fraction > 1) {
		return { achievable: false, supported: true, reason: 'Target is not reachable with the remaining items.' };
	}

	const scores = {};
	for (const item of editableItems) scores[item.id] = fraction * item.pointsPossible;

	return { achievable: true, supported: true, scores };
}
