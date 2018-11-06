import izendaCoreModule from 'common/core/module-definition';
import IzendaCompatibilityService from 'common/core/services/compatibility-service';
import IzendaEventService from 'common/core/services/event-service';
import IzendaLocalizationService from 'common/core/services/localization-service';
import IzendaUtilService from 'common/core/services/util-service';
import IzendaUtilUiService from 'common/core/services/util-ui-service';

// register services
IzendaCompatibilityService.register(izendaCoreModule);
IzendaEventService.register(izendaCoreModule);
IzendaLocalizationService.register(izendaCoreModule);
IzendaUtilService.register(izendaCoreModule);
IzendaUtilUiService.register(izendaCoreModule);

// register components and directives
import 'common/core/directives/bootstrap-modal';
import 'common/core/directives/utility';
import 'common/core/components/dialog-box/dialog-box-component';
import 'common/core/components/message/message-component';
import 'common/core/components/notification/notification-component';
