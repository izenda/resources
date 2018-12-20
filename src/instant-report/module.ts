import 'izenda-external-libs';
import izendaInstantReportModule from 'instant-report/module-definition';
import IzendaInstantReportQueryService from 'instant-report/services/instant-report-query';
import IzendaInstantReportPivotService from 'instant-report/services/instant-report-pivot';
import IzendaInstantReportSettingsService from 'instant-report/services/instant-report-settings';
import IzendaInstantReportVisualizationService from 'instant-report/services/instant-report-visualization';
import IzendaInstantReportStorageService from 'instant-report/services/instant-report-storage';
import IzendaInstantReportValidationService from 'instant-report/services/instant-report-validation';

IzendaInstantReportQueryService.register(izendaInstantReportModule);
IzendaInstantReportPivotService.register(izendaInstantReportModule);
IzendaInstantReportSettingsService.register(izendaInstantReportModule);
IzendaInstantReportVisualizationService.register(izendaInstantReportModule);
IzendaInstantReportStorageService.register(izendaInstantReportModule);
IzendaInstantReportValidationService.register(izendaInstantReportModule);

import 'instant-report/directive/instant-report-field-draggable';
import 'instant-report/directive/instant-report-left-panel-resize';

import 'instant-report/controllers/instant-report-charts-controller';
import 'instant-report/controllers/instant-report-columns-sort-controller';
import 'instant-report/controllers/instant-report-controller';
import 'instant-report/controllers/instant-report-data-source-controller';
import 'instant-report/controllers/instant-report-field-options-controller';
import 'instant-report/controllers/instant-report-filters-controller';
import 'instant-report/controllers/instant-report-format-controller';
import 'instant-report/controllers/instant-report-pivot-controller';
import 'instant-report/controllers/instant-report-validation-controller';
