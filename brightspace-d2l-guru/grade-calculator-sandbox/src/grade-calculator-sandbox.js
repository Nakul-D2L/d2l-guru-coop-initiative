import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/inputs/input-number.js';
import { calculateFinalGrade, solveForTarget, withoutDroppedLowest } from './calculator.js';
import { css, html, LitElement, nothing } from 'lit';

const COMPONENT_TAG = 'd2l-grade-calculator-sandbox';

// A worked example gradebook touching every calculation case from the proposal:
// locked and editable items, a dropped lowest score, an already-awarded bonus,
// an exempt item, and category weights (30 + 50 + 15) that don't sum to 100.
const DEFAULT_GRADEBOOK = {
	categories: [
		{
			id: 'quizzes',
			name: 'Quizzes',
			weight: 30,
			dropLowest: 1,
			items: [
				{ id: 'q1', name: 'Quiz 1', score: 9, pointsPossible: 10, isBonus: false, isExempt: false },
				{ id: 'q2', name: 'Quiz 2', score: 6, pointsPossible: 10, isBonus: false, isExempt: false },
				{ id: 'q3', name: 'Quiz 3', score: null, pointsPossible: 10, isBonus: false, isExempt: false }
			]
		},
		{
			id: 'assignments',
			name: 'Assignments',
			weight: 50,
			dropLowest: 0,
			items: [
				{ id: 'a1', name: 'Assignment 1', score: 18, pointsPossible: 20, isBonus: false, isExempt: false },
				{ id: 'a2', name: 'Assignment 2', score: null, pointsPossible: 20, isBonus: false, isExempt: false },
				{ id: 'a-bonus', name: 'Bonus assignment', score: 5, pointsPossible: null, isBonus: true, isExempt: false }
			]
		},
		{
			id: 'participation',
			name: 'Participation',
			weight: 15,
			dropLowest: 0,
			items: [
				{ id: 'p1', name: 'Week 1 participation', score: 10, pointsPossible: 10, isBonus: false, isExempt: false },
				{ id: 'p2', name: 'Week 2 participation', score: null, pointsPossible: 10, isBonus: false, isExempt: true }
			]
		}
	]
};

class GradeCalculatorSandbox extends LitElement {

	static properties = {
		gradebook: { type: Object },
		_currentGrade: { state: true },
		_currentSupported: { state: true },
		_currentTotalWeight: { state: true },
		_hasDropLowestCategory: { state: true },
		_hypotheticalScores: { state: true },
		_showWithoutDrop: { state: true },
		_solveResult: { state: true },
		_targetGrade: { state: true },
		_withoutDropGrade: { state: true }
	};

	static styles = css`
		:host {
			display: block;
			max-width: 40rem;
		}
		table {
			border-collapse: collapse;
			width: 100%;
		}
		th, td {
			border-bottom: 1px solid var(--d2l-color-mica);
			padding: 0.4rem 0.6rem;
			text-align: start;
		}
		.d2l-grade-calculator-sandbox-hypothetical {
			font-style: italic;
		}
		.d2l-grade-calculator-sandbox-badge {
			font-size: 0.7rem;
			text-transform: uppercase;
		}
		.d2l-grade-calculator-sandbox-total {
			font-weight: bold;
			margin-top: 1rem;
		}
		.d2l-grade-calculator-sandbox-reverse {
			align-items: center;
			display: flex;
			gap: 0.6rem;
			margin-top: 1.5rem;
		}
	`;

	constructor() {
		super();
		this.gradebook = DEFAULT_GRADEBOOK;
		this._currentGrade = null;
		this._currentSupported = false;
		this._currentTotalWeight = null;
		this._hasDropLowestCategory = false;
		this._hypotheticalScores = {};
		this._showWithoutDrop = false;
		this._solveResult = null;
		this._targetGrade = null;
		this._withoutDropGrade = null;
	}

	render() {
		return html`
			<d2l-alert type="warning">
				These are estimates only. The instructor cannot see them, and nothing here is saved.
			</d2l-alert>
			${this.gradebook.categories.map(category => this._renderCategory(category))}
			<p class="d2l-grade-calculator-sandbox-total">
				${this._currentSupported
					? html`Estimated final grade: ${this._formatPercentage(this._currentGrade)}`
					: html`Not enough information to estimate a final grade for this configuration.`}
			</p>
			${this._currentSupported && this._currentTotalWeight !== 100
				? html`<p>Covers ${this._currentTotalWeight}% of the course weight currently posted. The rest isn't graded yet.</p>`
				: nothing}
			${this._hasDropLowestCategory ? this._renderDropComparison() : nothing}
			<d2l-button @click="${this._onReset}">Reset</d2l-button>
			${this._renderReverseMode()}
		`;
	}

	willUpdate(changedProperties) {
		if (changedProperties.has('gradebook')) {
			this._hasDropLowestCategory = this.gradebook.categories.some(category => category.dropLowest > 0);
		}
		if (changedProperties.has('gradebook') || changedProperties.has('_hypotheticalScores')) {
			const { grade, supported, totalWeight } = calculateFinalGrade(this.gradebook, this._hypotheticalScores);
			this._currentGrade = grade;
			this._currentSupported = supported;
			this._currentTotalWeight = totalWeight;
		}
		if (this._showWithoutDrop &&
			(changedProperties.has('gradebook') || changedProperties.has('_hypotheticalScores') || changedProperties.has('_showWithoutDrop'))) {
			const { grade } = calculateFinalGrade(withoutDroppedLowest(this.gradebook), this._hypotheticalScores);
			this._withoutDropGrade = grade;
		}
	}

	_formatPercentage(value) {
		return `${Math.round(value * 10) / 10}%`;
	}

	_itemName(itemId) {
		for (const category of this.gradebook.categories) {
			const item = category.items.find(candidate => candidate.id === itemId);
			if (item) return item.name;
		}
		return itemId;
	}

	_onHypotheticalChange(e) {
		const itemId = e.target.dataItemId;
		const numericValue = Number(e.target.value);
		this._hypotheticalScores = {
			...this._hypotheticalScores,
			// Clearing the input must put the item back to "ungraded", not a hypothetical zero.
			[itemId]: Number.isFinite(numericValue) ? numericValue : undefined
		};
	}

	_onReset() {
		this._hypotheticalScores = {};
		this._solveResult = null;
		this._targetGrade = null;
	}

	_onSolve() {
		this._solveResult = solveForTarget(this.gradebook, Number(this._targetGrade), this._hypotheticalScores);
	}

	_onTargetChange(e) {
		this._targetGrade = e.target.value;
	}

	_onToggleDropComparison() {
		this._showWithoutDrop = !this._showWithoutDrop;
	}

	_renderCategory(category) {
		return html`
			<h3>
				${category.name} (${category.weight}%${category.dropLowest
					? html`, drops lowest ${category.dropLowest}`
					: nothing})
			</h3>
			<table>
				<thead>
					<tr><th>Item</th><th>Score</th><th></th></tr>
				</thead>
				<tbody>
					${category.items.map(item => this._renderItem(item))}
				</tbody>
			</table>
		`;
	}

	_renderDropComparison() {
		return html`
			<p>
				<d2l-button @click="${this._onToggleDropComparison}">
					${this._showWithoutDrop ? 'Hide' : 'Show'} grade without the dropped lowest score
				</d2l-button>
				${this._showWithoutDrop
					? html` — without the drop: ${this._formatPercentage(this._withoutDropGrade)}`
					: nothing}
			</p>
		`;
	}

	_renderItem(item) {
		if (item.isExempt) {
			return html`
				<tr>
					<td>${item.name}</td>
					<td>Exempt</td>
					<td>excluded, not zeroed</td>
				</tr>
			`;
		}

		if (item.score !== null) {
			return html`
				<tr>
					<td>${item.name}</td>
					<td>${item.score}${item.isBonus ? nothing : html` / ${item.pointsPossible}`}</td>
					<td><d2l-icon icon="tier1:lock-locked"></d2l-icon> graded</td>
				</tr>
			`;
		}

		return html`
			<tr class="d2l-grade-calculator-sandbox-hypothetical">
				<td>${item.name}</td>
				<td>
					<d2l-input-number
						label="${item.name} hypothetical score"
						label-hidden
						.min="${0}"
						.max="${item.pointsPossible}"
						.dataItemId="${item.id}"
						.value="${this._hypotheticalScores[item.id] ?? NaN}"
						@change="${this._onHypotheticalChange}">
					</d2l-input-number> / ${item.pointsPossible}
				</td>
				<td class="d2l-grade-calculator-sandbox-badge">estimate</td>
			</tr>
		`;
	}

	_renderReverseMode() {
		return html`
			<div class="d2l-grade-calculator-sandbox-reverse">
				<d2l-input-number
					label="Target final grade"
					.min="${0}"
					.value="${this._targetGrade ?? NaN}"
					@change="${this._onTargetChange}">
				</d2l-input-number>
				<d2l-button @click="${this._onSolve}">What do I need?</d2l-button>
			</div>
			${this._solveResult ? this._renderSolveResult() : nothing}
		`;
	}

	_renderSolveResult() {
		if (!this._solveResult.supported || !this._solveResult.achievable) {
			return html`<p>${this._solveResult.reason || 'That target is not reachable with what is left.'}</p>`;
		}

		const entries = Object.entries(this._solveResult.scores);
		if (entries.length === 0) {
			return html`<p>Already there with what is graded so far.</p>`;
		}

		return html`
			<ul>
				${entries.map(([itemId, score]) => html`
					<li>${this._itemName(itemId)}: ${this._formatPercentage(score)}</li>
				`)}
			</ul>
		`;
	}

}

customElements.define(COMPONENT_TAG, GradeCalculatorSandbox);
