import { calculateFinalGrade, solveForTarget } from '../src/calculator.js';
import { expect } from '@brightspace-ui/testing';

function item(id, overrides = {}) {
	return {
		id,
		pointsPossible: 10,
		score: null,
		isBonus: false,
		isExempt: false,
		...overrides
	};
}

function category(id, weight, items, dropLowest = 0) {
	return { id, weight, dropLowest, items };
}

describe('calculateFinalGrade', () => {

	it('matches the real grades page when there are no edits and an item is still ungraded', () => {
		const gradebook = {
			categories: [
				category('assignments', 100, [
					item('a1', { score: 8 }),
					item('a2', { score: null })
				])
			]
		};
		const { grade, supported } = calculateFinalGrade(gradebook);
		expect(supported).to.be.true;
		expect(grade).to.equal(80);
	});

	it('combines weighted categories containing multiple items', () => {
		const gradebook = {
			categories: [
				category('quizzes', 40, [item('q1', { score: 9 }), item('q2', { score: 7 })]),
				category('assignments', 60, [item('a1', { score: 10 }), item('a2', { score: 6 })])
			]
		};
		const { grade, supported } = calculateFinalGrade(gradebook);
		expect(supported).to.be.true;
		expect(grade).to.equal(80);
	});

	it('drops the lowest scoring item in a category', () => {
		const gradebook = {
			categories: [
				category('quizzes', 100, [
					item('q1', { score: 10 }),
					item('q2', { score: 10 }),
					item('q3', { score: 0 })
				], 1)
			]
		};
		const { grade, supported } = calculateFinalGrade(gradebook);
		expect(supported).to.be.true;
		expect(grade).to.equal(100);
	});

	it('lets bonus points push a category above its weight', () => {
		const gradebook = {
			categories: [
				category('quizzes', 100, [
					item('q1', { score: 10 }),
					item('q2', { score: 10, isBonus: true, pointsPossible: null })
				])
			]
		};
		const { grade, supported } = calculateFinalGrade(gradebook);
		expect(supported).to.be.true;
		expect(grade).to.equal(200);
	});

	it('excludes exempt items instead of scoring them as zero', () => {
		const gradebook = {
			categories: [
				category('quizzes', 100, [
					item('q1', { score: 8 }),
					item('q2', { score: null, isExempt: true })
				])
			]
		};
		const { grade, supported } = calculateFinalGrade(gradebook);
		expect(supported).to.be.true;
		expect(grade).to.equal(80);
	});

	it('shows nothing for an item with a weight but no possible points set', () => {
		const gradebook = {
			categories: [
				category('quizzes', 100, [
					item('q1', { score: 8, pointsPossible: null })
				])
			]
		};
		const { grade, supported } = calculateFinalGrade(gradebook);
		expect(supported).to.be.false;
		expect(grade).to.equal(null);
	});

	it('normalizes category weights that do not sum to 100', () => {
		const gradebook = {
			categories: [
				category('quizzes', 40, [item('q1', { score: 10 })]),
				category('assignments', 40, [item('a1', { score: 5 })])
			]
		};
		const { grade, supported } = calculateFinalGrade(gradebook);
		expect(supported).to.be.true;
		expect(grade).to.equal(75);
	});

});

describe('solveForTarget', () => {

	it('returns the score needed on the remaining item to reach a target', () => {
		const gradebook = {
			categories: [
				category('assignments', 100, [
					item('a1', { score: 8 }),
					item('a2', { score: null, pointsPossible: 10 })
				])
			]
		};
		const result = solveForTarget(gradebook, 90);
		expect(result.achievable).to.be.true;
		expect(result.scores.a2).to.equal(10);
	});

	it('says clearly when a target is not reachable', () => {
		const gradebook = {
			categories: [
				category('assignments', 100, [
					item('a1', { score: 4 }),
					item('a2', { score: null, pointsPossible: 10 })
				])
			]
		};
		const result = solveForTarget(gradebook, 95);
		expect(result.achievable).to.be.false;
		expect(result.reason).to.be.a('string');
	});

	it('declines to guess when a drop-lowest category still has an editable item', () => {
		const gradebook = {
			categories: [
				category('quizzes', 100, [
					item('q1', { score: 10 }),
					item('q2', { score: null, pointsPossible: 10 })
				], 1)
			]
		};
		const result = solveForTarget(gradebook, 100);
		expect(result.achievable).to.be.false;
		expect(result.supported).to.be.false;
	});

});
