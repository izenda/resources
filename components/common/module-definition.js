angular.module('izendaCompatibility', []);

angular.module('izendaQuery', []);

angular.module('izendaCommonControls', [
  'izendaCompatibility',
  'izendaQuery'
]);