function isSpecificIeVersion(version, comparison) {
  var ieCompareOperator = 'IE',
      b = document.createElement('B'),
      docElem = document.documentElement,
      isIeResult;
  if (version) {
    ieCompareOperator += ' ' + version;
    if (comparison) {
      ieCompareOperator = comparison + ' ' + ieCompareOperator;
    }
  }
  b.innerHTML = '<!--[if ' + ieCompareOperator + ']><b id="iecctest"></b><![endif]-->';
  docElem.appendChild(b);
  isIeResult = !!document.getElementById('iecctest');
  docElem.removeChild(b);
  var isCompatibilityMode = (typeof (document.documentMode) !== 'undefined') &&
  ((comparison === 'lte' && document.documentMode <= version)
    || (comparison === 'gte' && document.documentMode >= version)
    || (comparison === 'lt' && document.documentMode < version)
    || (comparison === 'gt' && document.documentMode > version)
    || (comparison === 'eq' && document.documentMode == version));
  return isIeResult || isCompatibilityMode;
}
