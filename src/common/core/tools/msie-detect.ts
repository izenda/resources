export default class MsieDetect {
	static isSpecificIeVersion(version: number, comparison: string): boolean {
		let ieCompareOperator = 'IE';
		const b = document.createElement('B');
		const docElem = document.documentElement;
		if (version) {
			ieCompareOperator += ` ${version}`;
			if (comparison) {
				ieCompareOperator = `${comparison} ${ieCompareOperator}`;
			}
		}
		b.innerHTML = `<!--[if ${ieCompareOperator}]><b id="iecctest"></b><![endif]-->`;
		docElem.appendChild(b);
		const isIeResult = !!document.getElementById('iecctest');
		docElem.removeChild(b);
		const docMode = document['documentMode'];
		const isCompatibilityMode =
			(typeof docMode !== 'undefined' &&
				(
					(comparison === 'lte' && Number(docMode) <= version) ||
					(comparison === 'gte' && Number(docMode) >= version) ||
					(comparison === 'lt' && Number(docMode) < version) ||
					(comparison === 'gt' && Number(docMode) > version) ||
					(comparison === 'eq' && Number(docMode) === version)));
		return isIeResult || isCompatibilityMode;
	}
}
