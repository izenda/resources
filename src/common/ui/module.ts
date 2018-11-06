import izendaUiModule from 'common/ui/module-definition';
import IzendaShareService from 'common/ui/services/share-service';
import IzendaScheduleService from 'common/ui/services/schedule-service';
IzendaShareService.register(izendaUiModule);
IzendaScheduleService.register(izendaUiModule);

// register components and directives
import 'common/ui/directives/align-switcher';
import 'common/ui/directives/autocomplete';
import 'common/ui/directives/bootstrap';
import 'common/ui/directives/color-picker';
import 'common/ui/directives/datetime-picker';
import 'common/ui/directives/report-viewer';
import 'common/ui/directives/select-checkboxes';
import 'common/ui/directives/splashscreen';
import 'common/ui/directives/switcher';
import 'common/ui/directives/toggle-button';
import 'common/ui/components/schedule/schedule-component';
import 'common/ui/components/select-report/select-report-component';
import 'common/ui/components/select-report-name/select-report-name-component';
import 'common/ui/components/share/share-component';