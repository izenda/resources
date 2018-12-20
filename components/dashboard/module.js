var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
izendaRequire.define("common/core/module-definition", ["require", "exports", "angular"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // create izenda.common.core angular module
    var izendaCoreModule = angular.module('izenda.common.core', ['rx']);
    exports.default = izendaCoreModule;
});
izendaRequire.define("common/core/tools/msie-detect", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MsieDetect = /** @class */ (function () {
        function MsieDetect() {
        }
        MsieDetect.isSpecificIeVersion = function (version, comparison) {
            var ieCompareOperator = 'IE';
            var b = document.createElement('B');
            var docElem = document.documentElement;
            if (version) {
                ieCompareOperator += " " + version;
                if (comparison) {
                    ieCompareOperator = comparison + " " + ieCompareOperator;
                }
            }
            b.innerHTML = "<!--[if " + ieCompareOperator + "]><b id=\"iecctest\"></b><![endif]-->";
            docElem.appendChild(b);
            var isIeResult = !!document.getElementById('iecctest');
            docElem.removeChild(b);
            var docMode = document['documentMode'];
            var isCompatibilityMode = (typeof docMode !== 'undefined' &&
                ((comparison === 'lte' && Number(docMode) <= version) ||
                    (comparison === 'gte' && Number(docMode) >= version) ||
                    (comparison === 'lt' && Number(docMode) < version) ||
                    (comparison === 'gt' && Number(docMode) > version) ||
                    (comparison === 'eq' && Number(docMode) === version)));
            return isIeResult || isCompatibilityMode;
        };
        return MsieDetect;
    }());
    exports.default = MsieDetect;
});
izendaRequire.define("common/core/services/compatibility-service", ["require", "exports", "common/core/tools/msie-detect", "izenda-external-libs"], function (require, exports, msie_detect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaCompatibilityService = /** @class */ (function () {
        function IzendaCompatibilityService($window) {
            this.$window = $window;
            this.rightNone = 'None';
            this.rightReadOnly = 'Read Only';
            this.rightViewOnly = 'View Only';
            this.rightLocked = 'Locked';
            this.rightFullAccess = 'Full Access';
            this.currentRights = this.rightNone;
            this.ie8 = msie_detect_1.default.isSpecificIeVersion(8, 'lte');
            this.lteIe10 = msie_detect_1.default.isSpecificIeVersion(10, 'lte');
            this.gteIe9 = msie_detect_1.default.isSpecificIeVersion(9, 'gte');
        }
        Object.defineProperty(IzendaCompatibilityService, "injectModules", {
            get: function () {
                return ['$window'];
            },
            enumerable: true,
            configurable: true
        });
        IzendaCompatibilityService.prototype.isIe8 = function () {
            return this.ie8;
        };
        IzendaCompatibilityService.prototype.isIe = function () {
            return this.gteIe9;
        };
        IzendaCompatibilityService.prototype.isLteIe10 = function () {
            return this.lteIe10;
        };
        IzendaCompatibilityService.prototype.isHtml5FullScreenSupported = function () {
            return !this.lteIe10
                && (document['fullscreenEnabled'] || document['webkitFullscreenEnabled'] || document['mozFullScreenEnabled'] || document['msFullscreenEnabled']);
        };
        /**
         * Check is page should have mobile view.
         */
        IzendaCompatibilityService.prototype.isMobile = function () {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        };
        /**
         * Check is page window is too small to fit several columns of tiles.
         */
        IzendaCompatibilityService.prototype.isSmallResolution = function () {
            return this.$window.innerWidth <= 991;
        };
        /**
         * Check if one column view required
         */
        IzendaCompatibilityService.prototype.isOneColumnView = function () {
            return this.isMobile() || this.isSmallResolution();
        };
        ;
        /**
         * Set flag that indicates that report with hidden columns is currenly loaded.
         */
        IzendaCompatibilityService.prototype.setUsesHiddenColumns = function (value) {
            this.usesHiddenColumns = value;
        };
        /**
         * Get flat that indicates that report with hidden columns is currenly loaded.
         */
        IzendaCompatibilityService.prototype.isUsesHiddenColumns = function () {
            return this.usesHiddenColumns;
        };
        /**
         * Set rights for current dashboard
         */
        IzendaCompatibilityService.prototype.setRights = function (rights) {
            this.currentRights = rights ? rights : this.rightNone;
        };
        /**
         * Get current rights
         */
        IzendaCompatibilityService.prototype.getRights = function () {
            return this.currentRights ? this.currentRights : this.rightNone;
        };
        /**
         * Set full access right as current right.
         */
        IzendaCompatibilityService.prototype.setFullAccess = function () {
            this.setRights(this.rightFullAccess);
        };
        /**
         * Check is tile editing allowed.
         */
        IzendaCompatibilityService.prototype.isFullAccess = function () {
            var allowed = [this.rightFullAccess].indexOf(this.getRights()) >= 0;
            allowed = allowed && !this.isIe8();
            return allowed;
        };
        /**
         * Check is tile editing allowed.
         */
        IzendaCompatibilityService.prototype.isEditAllowed = function () {
            var allowed = [this.rightFullAccess, this.rightReadOnly].indexOf(this.getRights()) >= 0;
            allowed = allowed && !this.isOneColumnView();
            allowed = allowed && !this.isIe8();
            return allowed;
        };
        /**
         * Check is save as allowed
         */
        IzendaCompatibilityService.prototype.isSaveAsAllowed = function () {
            var allowed = [this.rightFullAccess, this.rightReadOnly].indexOf(this.getRights()) >= 0;
            allowed = allowed && !this.isIe8();
            return allowed;
        };
        /**
         * Check is save allowed with hidden columns
         */
        IzendaCompatibilityService.prototype.isSaveAllowedWithHidden = function () {
            var allowed = [this.rightFullAccess].indexOf(this.getRights()) >= 0;
            allowed = allowed && !this.isIe8();
            return allowed;
        };
        /**
         * Check is save allowed
         */
        IzendaCompatibilityService.prototype.isSaveAllowed = function () {
            return this.isSaveAllowedWithHidden() && !this.usesHiddenColumns;
        };
        /**
         * Check is filters editing allowed
         */
        IzendaCompatibilityService.prototype.isFiltersEditAllowed = function () {
            var allowed = [this.rightFullAccess, this.rightReadOnly, this.rightLocked].indexOf(this.getRights()) >= 0;
            allowed = allowed && !this.isIe8();
            return allowed;
        };
        Object.defineProperty(IzendaCompatibilityService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaCompatibilityService.register = function (module) {
            module.service('$izendaCompatibilityService', IzendaCompatibilityService.injectModules.concat(IzendaCompatibilityService));
        };
        return IzendaCompatibilityService;
    }());
    exports.default = IzendaCompatibilityService;
});
izendaRequire.define("common/core/services/event-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaEventService = /** @class */ (function () {
        function IzendaEventService($rootScope, $log) {
            this.$rootScope = $rootScope;
            this.$log = $log;
            this.events = {};
        }
        Object.defineProperty(IzendaEventService, "injectModules", {
            get: function () {
                return ['$rootScope', '$log'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Add event to queue.
         */
        IzendaEventService.prototype.queueEvent = function (eventName, eventArguments, clearQueue) {
            if (!(eventName in this.events) || clearQueue) {
                this.events[eventName] = [];
            }
            var eventRecord = {
                args: eventArguments
            };
            this.events[eventName].push(eventRecord);
            this.$log.debug("event \"" + eventName + "\" queued");
            this.$rootScope.$broadcast(eventName, eventArguments);
        };
        /**
         * Retrieve event record from queue and return it's record.
         */
        IzendaEventService.prototype.handleQueuedEvent = function (eventName, scope, eventContext, eventHandler) {
            var _this = this;
            if (!angular.isFunction(eventHandler))
                throw 'eventHandler should be a function';
            if (!(eventName in this.events) || !angular.isArray(this.events[eventName]))
                this.events[eventName] = [];
            while (this.events[eventName].length > 0) {
                var eventRecord = this.events[eventName].shift();
                this.$log.debug("event \"" + eventName + "\" run from queue");
                eventHandler.apply(eventContext, eventRecord.args);
            }
            // start handling event using angular events.
            if (scope.$$listeners) {
                var eventArr = scope.$$listeners[eventName];
                if (eventArr) {
                    for (var i = 0; i < eventArr.length; i++) {
                        if (eventArr[i] === eventHandler) {
                            eventArr.splice(i, 1);
                        }
                    }
                }
            }
            ;
            scope.$on(eventName, function (event, args) {
                _this.$log.debug("event \"" + eventName + "\" run from $on");
                _this.events[eventName] = [];
                eventHandler.apply(eventContext, args);
            });
        };
        /**
         * Clear all queued events (for manual $broadcast handling)
         */
        IzendaEventService.prototype.clearEventQueue = function (eventName) {
            this.events[eventName] = [];
        };
        Object.defineProperty(IzendaEventService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaEventService.register = function (module) {
            module.service('$izendaEventService', IzendaEventService.injectModules.concat(IzendaEventService));
        };
        return IzendaEventService;
    }());
    exports.default = IzendaEventService;
});
izendaRequire.define("common/core/services/localization-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Localization service. Gets localized strings from the "IzLocal" object.
     */
    var IzendaLocalizationService = /** @class */ (function () {
        function IzendaLocalizationService() {
            IzLocal.LocalizePage();
        }
        Object.defineProperty(IzendaLocalizationService, "injectModules", {
            get: function () {
                return [];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Get localized text.
         * @param {string} key. Locale string key (defined in resources.aspx)
         * @param {string} defaultValue. Default value, when locale text couldn't be got
         * @returns {string} localized text.
         */
        IzendaLocalizationService.prototype.localeText = function (key, defaultValue) {
            var defaultText = angular.isString(defaultValue) ? defaultValue : '';
            return IzLocal.Res(key, defaultText);
        };
        /**
         * Apply locale string in format "...{0}...{1}..." and apply instead of '{n}' params[n]
         * @param {string} locale text key. This key contains in resources.
         * @param {strong} defaultValue. Default value if locale resource wasn't found.
         * @param {Array} params. Additional params.
         * @returns {string}. Localized text.
         */
        IzendaLocalizationService.prototype.localeTextWithParams = function (key, defaultValue, params) {
            var result = this.localeText(key, defaultValue);
            if (angular.isArray(params))
                params.forEach(function (param, iParam) {
                    return result = result.replaceAll("{" + iParam + "}", param);
                });
            return result;
        };
        Object.defineProperty(IzendaLocalizationService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaLocalizationService.register = function (module) {
            module.service('$izendaLocaleService', IzendaLocalizationService.injectModules.concat(IzendaLocalizationService));
            /**
             * Filter which is used for the applying localization.
             * Sample usage: <div ng-bind=":: 'js_close' | izendaLocale: 'Close'" /> where 'Close' - "defaultValue" parameter value.
             */
            module.filter('izendaLocale', [
                '$izendaLocaleService',
                function ($izendaLocaleService) {
                    return function (text, defaultValue) { return $izendaLocaleService.localeText(text, defaultValue); };
                }
            ]);
        };
        return IzendaLocalizationService;
    }());
    exports.default = IzendaLocalizationService;
});
izendaRequire.define("common/core/services/util-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Utility service. Provides the utility functions.
     */
    var IzendaUtilService = /** @class */ (function () {
        function IzendaUtilService($izendaLocaleService) {
            this.$izendaLocaleService = $izendaLocaleService;
        }
        Object.defineProperty(IzendaUtilService, "injectModules", {
            get: function () {
                return ['$izendaLocaleService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Create human readable variable name version
         * @param {string} text Text
         */
        IzendaUtilService.prototype.humanizeVariableName = function (text) {
            if (!angular.isString(text))
                return text;
            var result = text
                // insert a space between lower & upper
                .replace(/([a-z])([A-Z\d])/g, '$1 $2')
                // space before last upper in a sequence followed by lower
                .replace(/\b([A-Z\d]+)([A-Z\d])([a-z])/, '$1 $2$3')
                // uppercase the first character
                .replace(/^./, function (txt) { return txt.toUpperCase(); });
            return result;
        };
        Object.defineProperty(IzendaUtilService.prototype, "uncategorized", {
            /**
             * "Uncategorized" category localized name getter.
             */
            get: function () {
                return this.$izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Get "Uncategorized" category localized name.
         */
        IzendaUtilService.prototype.getUncategorized = function () {
            return this.uncategorized;
        };
        /**
         * Check whether "uncategorized" category or not.
         */
        IzendaUtilService.prototype.isUncategorized = function (category) {
            if (!category || !angular.isString(category))
                return true;
            return category.toLowerCase() === this.uncategorized.toLowerCase();
        };
        /**
         * Check whether categories equal or not.
         * @param {string} cat1 Category name.
         * @param {string} cat2 Category name.
         */
        IzendaUtilService.prototype.isCategoriesEqual = function (cat1, cat2) {
            return (this.isUncategorized(cat1) && this.isUncategorized(cat2)) || cat1 === cat2;
        };
        /**
         * Generate report full name
         * @param {string} reportName report name.
         * @param {string} separator directories separator symbol.
         * @param {string} category report category (optional).
         * @return {string} generated report full name.
         */
        IzendaUtilService.prototype.createReportFullName = function (reportName, separator, category) {
            if (!reportName || reportName.trim() === '')
                throw new Error('Empty "reportName" parameter isn\'t allowed.');
            return this.isUncategorized(category)
                ? reportName
                : category + separator + reportName;
        };
        /**
         * Convert options which have got from server using "GetOptionsByPath" query into
         * one dimentional array, which allow to use it as <option>
         */
        IzendaUtilService.prototype.convertOptionsByPath = function (optionGroups) {
            if (!angular.isArray(optionGroups))
                return [];
            var groups = [];
            optionGroups.forEach(function (group) {
                group.options.forEach(function (option) {
                    option.group = angular.isString(group.name) && group.name !== ''
                        ? group.name
                        : undefined;
                    groups.push(option);
                });
            });
            return groups;
        };
        /**
         * Get option by value from array of objects with "value" property (case insensitive):
         * [{value:'text1',...}, {value:'text2', ...}, ...]
         */
        IzendaUtilService.prototype.getOptionByValue = function (options, value, isLowerCaseComparison) {
            var i = 0;
            if (!angular.isArray(options) || !options.length)
                return null;
            while (i < options.length) {
                var option = options[i];
                if (!isLowerCaseComparison && option.value === value)
                    return option;
                if (isLowerCaseComparison && option.value.toLowerCase() === value.toLowerCase())
                    return option;
                i++;
            }
            return null;
        };
        Object.defineProperty(IzendaUtilService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaUtilService.register = function (module) {
            module.service('$izendaUtilService', IzendaUtilService.injectModules.concat(IzendaUtilService));
        };
        return IzendaUtilService;
    }());
    exports.default = IzendaUtilService;
});
izendaRequire.define("common/core/services/util-ui-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaUtilUiService = /** @class */ (function () {
        function IzendaUtilUiService($timeout, $izendaLocaleService) {
            this.$timeout = $timeout;
            this.$izendaLocaleService = $izendaLocaleService;
            this.notificationHideDelay = 5000;
            this.notificationsIdCounter = 1;
            this.notifications = [];
            this.message = null;
            this.dialogBox = null;
        }
        Object.defineProperty(IzendaUtilUiService, "injectModules", {
            get: function () {
                return ['$timeout', '$izendaLocaleService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Immediately close notification.
         * @param {number} notificationId notification id
         */
        IzendaUtilUiService.prototype.closeNotification = function (notificationId) {
            var i = 0;
            while (i < this.notifications.length) {
                if (this.notifications[i].id === notificationId) {
                    this.cancelNotificationTimeout(notificationId);
                    this.notifications.splice(i, 1);
                    return;
                }
                i++;
            }
        };
        /**
         * Cancel notification autohide.
         * @param {number} notificationId notification id
         */
        IzendaUtilUiService.prototype.cancelNotificationTimeout = function (notificationId) {
            var itm = this.getNotificationById(notificationId);
            if (itm.timeoutId) {
                this.$timeout.cancel(itm.timeoutId);
                itm.timeoutId = null;
            }
        };
        /**
         *  Shows pop up notification panel. If no <izenda-notification-component> defined or no components with componentId will be found
         * then nothing will happen.
         * @param {string} text Message text.
         * @param {string} title Title text (optional).
         * @param {string} icon Icon (optional). Possible values 'error' or no value.
         */
        IzendaUtilUiService.prototype.showNotification = function (text, title, icon) {
            var _this = this;
            var nextId = this.notificationsIdCounter++;
            var iconClass = angular.isString(icon) && icon === 'error' ? 'glyphicon glyphicon-exclamation-sign' : '';
            var objToShow = {
                id: nextId,
                title: title ? title : '',
                text: text,
                iconClass: iconClass,
                timeoutId: null
            };
            objToShow.timeoutId = this.$timeout(function () {
                _this.closeNotification(objToShow.id);
            }, this.notificationHideDelay);
            this.notifications.push(objToShow);
        };
        /**
         * Shows message dialog. If no <izenda-message-component> defined or no components with componentId will be found
         * then nothing will happen.
         * @param {string} message Message text.
         * @param {string} title Title text (optional).
         * @param {string} alertInfo Type of dialog (optional). Possible values: 'success', 'info', 'warning', 'danger'
         */
        IzendaUtilUiService.prototype.showMessageDialog = function (message, title, alertInfo) {
            this.message = {
                message: message,
                title: angular.isDefined(title) ? title : '',
                alertInfo: angular.isDefined(alertInfo) ? alertInfo : 'info'
            };
        };
        /**
         * Shows error dialog.
         * @param {string} componentId ID of component. Used for distinguish different similar components.
         * @param {string} message Error text
         * @param {string} title Error title (optional)
         */
        IzendaUtilUiService.prototype.showErrorDialog = function (message, title) {
            var titleText = angular.isDefined(title) ? title : this.$izendaLocaleService.localeText('js_Error', 'Error');
            this.showMessageDialog(message, titleText, 'danger');
        };
        /**
         * Close message dialog.
         */
        IzendaUtilUiService.prototype.closeMessageDialog = function () {
            this.message = null;
        };
        /**
         * Shows dialog box. If no <izenda-dialog-box-component> defined or no components with componentId will be found
         * then nothing will happen.
         * @param {string} message Message text.
         * @param {string} title Title text (optional).
         * @param {string} alertInfo Type of dialog (optional). Possible values: 'success', 'info', 'warning', 'danger'
         * @param {Array} buttons dialog buttons (optional).
         * @param {Array} checkboxes checkboxes collection (optional).
         */
        IzendaUtilUiService.prototype.showDialogBox = function (options) {
            this.dialogBox = {
                message: options.message,
                title: angular.isDefined(options.title) ? options.title : '',
                alertInfo: angular.isDefined(options.alertInfo) ? options.alertInfo : 'info',
                buttons: angular.isDefined(options.buttons) ? options.buttons : [{ text: 'Close' }],
                checkboxes: angular.isDefined(options.checkboxes) ? options.checkboxes : []
            };
        };
        /**
         * Close dialog box
         */
        IzendaUtilUiService.prototype.closeDialogBox = function () {
            this.dialogBox = null;
        };
        IzendaUtilUiService.prototype.getNotificationById = function (id) {
            var found = this.notifications.find(function (n) {
                return n.id === id;
            });
            return found ? found : null;
        };
        Object.defineProperty(IzendaUtilUiService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaUtilUiService.register = function (module) {
            module.service('$izendaUtilUiService', IzendaUtilUiService.injectModules.concat(IzendaUtilUiService));
        };
        return IzendaUtilUiService;
    }());
    exports.default = IzendaUtilUiService;
});
izendaRequire.define("common/core/directives/bootstrap-modal", ["require", "exports", "angular", "common/core/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Bootstrap modal directive. Usage:
     * <izenda-bootstrap-modal opened="...">...</izenda-bootstrap-modal>
     */
    var IzendaBootstrapModalDirective = /** @class */ (function () {
        function IzendaBootstrapModalDirective($timeout) {
            this.$timeout = $timeout;
            this.restrict = 'E';
            this.transclude = true;
            this.scope = {
                opened: '=',
                keyboard: '=',
                backdrop: '=',
                modalSize: '@',
                isModernBootstrapVersion: '@',
                onModalOpened: '&',
                onModalClosed: '&'
            };
            this.template = "\n<div class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"true\">\n\t<div class=\"modal-dialog\" ng-class=\"getModalSizeClass()\">\n\t\t<div class=\"modal-content\">\n\t\t\t<div ng-transclude=\"\"></div>\n\t\t</div>\n\t</div>\n</div>";
            IzendaBootstrapModalDirective.prototype.link = function ($directiveScope, $element) {
                $directiveScope.getModalSizeClass = function () { return $directiveScope.modalSize === 'large' ? 'modal-lg' : ''; };
                var $modal = $element.children('.modal');
                if (!$directiveScope.isModernBootstrapVersion) {
                    $modal.css({
                        'overflow-x': 'hidden',
                        'overflow-y': 'scroll'
                    });
                }
                // additional bootstrap parameters
                if ($directiveScope.keyboard != null)
                    $modal.attr('data-keyboard', $directiveScope.keyboard);
                if ($directiveScope.backdrop != null)
                    $modal.attr('data-backdrop', $directiveScope.backdrop);
                // modal show handler
                $modal.on('show.bs.modal', function () {
                    $modal.css('background-color', 'rgba(0,0,0,0.8)');
                    $modal.css('filter', 'alpha(opacity=80)');
                    if (!$directiveScope.isModernBootstrapVersion) {
                        angular.element('body').css('margin-right', '0');
                        angular.element('body').css('overflow', 'hidden');
                    }
                });
                // modal shown handler
                $modal.on('shown.bs.modal', function () {
                    if (!$directiveScope.isModernBootstrapVersion) {
                        angular.element('body').css('overflow', 'hidden');
                        angular.element('body').scrollTop();
                    }
                    if (angular.isFunction($directiveScope.onModalOpened)) {
                        $directiveScope.onModalOpened({});
                    }
                    $directiveScope.$applyAsync();
                });
                // modal hidden handler
                $modal.on('hidden.bs.modal', function () {
                    if (!$directiveScope.isModernBootstrapVersion) {
                        angular.element('body').css('overflow', 'inherit');
                        angular.element('body').css('margin-right', '0');
                    }
                    $directiveScope.opened = false;
                    if (angular.isFunction($directiveScope.onModalClosed)) {
                        $directiveScope.onModalClosed({});
                    }
                    $directiveScope.$applyAsync();
                });
                $directiveScope.$watch('opened', function (newVal) {
                    // create/hide modal dialog
                    if (newVal)
                        $element.children('.modal')['modal']();
                    else
                        $element.children('.modal')['modal']('hide');
                });
            };
        }
        IzendaBootstrapModalDirective.factory = function () {
            var directive = function ($timeout) { return new IzendaBootstrapModalDirective($timeout); };
            directive.$inject = ['$timeout'];
            return directive;
        };
        return IzendaBootstrapModalDirective;
    }());
    module_definition_1.default.directive('izendaBootstrapModal', ['$timeout', IzendaBootstrapModalDirective.factory()]);
});
izendaRequire.define("common/core/directives/utility", ["require", "exports", "angular", "common/core/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Angular filter which replaces string.
     * Usage:
     * {{ 'some string' | izendaReplaceString: [{ from: 's', to: '$' }, { from: 'o', to: '0' } ] }}
     * this sample will produce string '$0me $tring'
     */
    module_definition_2.default.filter('izendaReplaceString', function () {
        return function (text, rules) {
            if (!angular.isArray(rules))
                return text;
            var resultText = text;
            if (!resultText)
                return resultText;
            rules.forEach(function (rule) { return resultText = resultText.replaceAll(rule.from, rule.to); });
            return resultText;
        };
    });
    /**
     * Attribute directive "izenda-scroll-bottom-action=""" which fires handler on container scroll end (-100px).
     * Event: scroll-bottom-action
     */
    var IzendaScrollBottomAction = /** @class */ (function () {
        function IzendaScrollBottomAction() {
            this.restrict = 'A';
            IzendaScrollBottomAction.prototype.link =
                function ($scope, $element, attrs) {
                    var $parent = $element.parent();
                    $parent.on('scroll', function () {
                        var height = $element.height();
                        if (height === 0)
                            return;
                        if (height - $parent.height() - 100 < $parent.scrollTop()) {
                            $scope.$eval(attrs.izendaScrollBottomAction);
                        }
                    });
                };
        }
        IzendaScrollBottomAction.factory = function () {
            return function () { return new IzendaScrollBottomAction(); };
        };
        return IzendaScrollBottomAction;
    }());
    exports.IzendaScrollBottomAction = IzendaScrollBottomAction;
    module_definition_2.default.directive('izendaScrollBottomAction', [IzendaScrollBottomAction.factory()]);
    /**
     * Set focus on element directive.
     * Usage:
     * <some-tag izenda-focus="{{expression_which_returns_bool}}" ...>
     *   ...
     * </some-tag>
     */
    var IzendaFocus = /** @class */ (function () {
        function IzendaFocus($timeout) {
            var _this = this;
            this.$timeout = $timeout;
            this.scope = {
                trigger: '@izendaFocus'
            };
            IzendaFocus.prototype.link = function ($scope, $element) {
                $scope.$watch('trigger', function (value) {
                    if (value)
                        _this.$timeout(function () { return $element[0].focus(); });
                });
            };
        }
        IzendaFocus.factory = function () {
            var directive = function ($timeout) { return new IzendaFocus($timeout); };
            directive.$inject = ['$timeout'];
            return directive;
        };
        return IzendaFocus;
    }());
    module_definition_2.default.directive('izendaFocus', ['$timeout', IzendaFocus.factory()]);
    /**
     * izenda-fit-absolute-element directive.
     */
    var IzendaFitAbsoluteElement = /** @class */ (function () {
        function IzendaFitAbsoluteElement($window, $timeout, $interval) {
            var _this = this;
            this.$window = $window;
            this.$timeout = $timeout;
            this.$interval = $interval;
            this.restrict = 'A';
            IzendaFitAbsoluteElement.prototype.link = function ($scope, $element, attrs) {
                var windowResizeEventName = "resize.izendaFitAbsoluteElement." + Math.random();
                var deltaTopString = String(attrs['deltaTop']);
                var deltaTop = parseInt(deltaTopString) || 0;
                var $parent = angular.element($element.parent());
                var topCache = -1;
                var setTop = function () {
                    var $childs = $parent.children('[data-izenda-fit-absolute-element-relative=top]');
                    if ($childs.length === 0)
                        return false;
                    var topHeight = 0;
                    var isSuccess = true;
                    for (var i = 0; i < $childs.length; i++) {
                        var $child = angular.element($childs[i]);
                        var topValue = String($child.attr('data-izenda-fit-absolute-element-relative'));
                        if (topValue === 'top') {
                            var childHeight = $child.height();
                            if (childHeight <= 0)
                                isSuccess = false;
                            topHeight += childHeight;
                        }
                    }
                    if (topHeight > 0 && topCache < 0 || topHeight + deltaTop !== topCache) {
                        topCache = topHeight + deltaTop;
                        $element.css('top', topHeight + deltaTop + 'px');
                    }
                    return isSuccess;
                };
                var setTopUntilSuccess = function () {
                    var attemptCount = 0;
                    if (setTop())
                        return;
                    var toolbarIntervalPromise = _this.$interval(function () {
                        if (setTop() || attemptCount > 50) {
                            _this.$interval.cancel(toolbarIntervalPromise);
                            toolbarIntervalPromise = null;
                            attemptCount = 0;
                        }
                        attemptCount++;
                    }, 100);
                };
                setTopUntilSuccess();
                angular.element(_this.$window).on(windowResizeEventName, function () {
                    setTopUntilSuccess();
                });
                angular.element(_this.$window).on('izendaCustomResize', function () {
                    setTopUntilSuccess();
                });
                // destruction method
                $element.on('$destroy', function () {
                    angular.element(_this.$window).off(windowResizeEventName);
                    angular.element(_this.$window).off('izendaCustomResize');
                });
            };
        }
        IzendaFitAbsoluteElement.factory = function () {
            var directive = function ($window, $timeout, $interval) { return new IzendaFitAbsoluteElement($window, $timeout, $interval); };
            directive.$inject = ['$window', '$timeout', '$interval'];
            return directive;
        };
        return IzendaFitAbsoluteElement;
    }());
    module_definition_2.default.directive('izendaFitAbsoluteElement', IzendaFitAbsoluteElement.factory());
    /**
     * Directive for input element which allows to input only positive integer values.
     */
    var IzendaIntegerInput = /** @class */ (function () {
        function IzendaIntegerInput() {
            this.restrict = 'A';
            IzendaFitAbsoluteElement.prototype.link =
                function ($scope, $element) {
                    $element.on('keydown', function (evt) {
                        var ctrlOrMeta = evt.ctrlKey || evt.metaKey;
                        if ([46, 8, 9, 27, 13].indexOf(evt.keyCode) >= 0 /*Allow: backspace, delete, tab, escape, enter*/
                            || (evt.keyCode === 65 && ctrlOrMeta) /*Allow: Ctrl/cmd+A*/
                            || (evt.keyCode === 67 && ctrlOrMeta) /*Allow: Ctrl/cmd+C*/
                            || (evt.keyCode === 88 && ctrlOrMeta) /*Allow: Ctrl/cmd+X*/
                            || (evt.keyCode >= 35 && evt.keyCode <= 40)) { /*Allow: home, end, left, right*/
                            // let it happen, don't do anything
                            return;
                        }
                        // Ensure that it is a number and stop the keypress
                        if ((evt.shiftKey || (evt.keyCode < 48 || evt.keyCode > 57)) && (evt.keyCode < 96 || evt.keyCode > 105)) {
                            evt.preventDefault();
                        }
                    });
                };
        }
        IzendaIntegerInput.factory = function () {
            var directive = function () { return new IzendaIntegerInput(); };
            return directive;
        };
        return IzendaIntegerInput;
    }());
    module_definition_2.default.directive('izendaIntegerInput', IzendaIntegerInput.factory());
});
izendaRequire.define("common/core/tools/izenda-component", ["require", "exports", "angular"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // ReSharper disable once InconsistentNaming
    function IzendaComponent(moduleOrName, selector, dependencies, options) {
        return function (controller) {
            var module = typeof (moduleOrName) === 'string' ? angular.module(moduleOrName) : moduleOrName;
            var extendedOptions = angular.copy(options);
            var $inject = controller.$inject = dependencies;
            controller.prototype.$inject = $inject;
            controller.$inject = $inject;
            extendedOptions.controller = dependencies.concat(controller);
            module.component(selector, extendedOptions);
        };
    }
    exports.default = IzendaComponent;
});
izendaRequire.define("common/core/components/dialog-box/dialog-box-component", ["require", "exports", "angular", "common/core/module-definition", "common/core/tools/izenda-component", "common/core/services/util-ui-service", "izenda-external-libs"], function (require, exports, angular, module_definition_3, izenda_component_1, util_ui_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Message component definition
     */
    var IzendaDialogBoxComponent = /** @class */ (function () {
        function IzendaDialogBoxComponent($izendaUtilUiService) {
            this.$izendaUtilUiService = $izendaUtilUiService;
        }
        /**
         * Handle button click.
         */
        IzendaDialogBoxComponent.prototype.onButtonClick = function (button) {
            if (!button)
                return;
            if (angular.isFunction(button.callback)) {
                button.callback(this.$izendaUtilUiService.dialogBox.checkboxes);
            }
            this.closeModal();
        };
        /**
         * Close modal dialog.
         */
        IzendaDialogBoxComponent.prototype.closeModal = function () {
            this.$izendaUtilUiService.closeDialogBox();
        };
        IzendaDialogBoxComponent = __decorate([
            izenda_component_1.default(module_definition_3.default, 'izendaDialogBoxComponent', ['$izendaUtilUiService'], {
                templateUrl: '###RS###extres=components.common.core.components.dialog-box.dialog-box-template.html',
                bindings: {
                    componentId: '@',
                    useGlobalEventListening: '<',
                    opened: '<',
                    title: '<',
                    message: '<',
                    alertInfo: '<',
                    buttons: '<',
                    checkboxes: '<'
                },
            }),
            __metadata("design:paramtypes", [util_ui_service_1.default])
        ], IzendaDialogBoxComponent);
        return IzendaDialogBoxComponent;
    }());
    exports.default = IzendaDialogBoxComponent;
});
izendaRequire.define("common/core/components/message/message-component", ["require", "exports", "common/core/module-definition", "common/core/tools/izenda-component", "common/core/services/localization-service", "common/core/services/util-ui-service", "izenda-external-libs"], function (require, exports, module_definition_4, izenda_component_2, localization_service_1, util_ui_service_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Message component definition
     */
    var IzendaMessageComponent = /** @class */ (function () {
        function IzendaMessageComponent($izendaLocaleService, $izendaUtilUiService) {
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaUtilUiService = $izendaUtilUiService;
        }
        /**
         * Close modal dialog.
         */
        IzendaMessageComponent.prototype.closeModal = function () {
            this.$izendaUtilUiService.closeMessageDialog();
        };
        IzendaMessageComponent = __decorate([
            izenda_component_2.default(module_definition_4.default, 'izendaMessageComponent', ['$izendaLocaleService', '$izendaUtilUiService'], {
                templateUrl: '###RS###extres=components.common.core.components.message.message-template.html',
                bindings: {},
            }),
            __metadata("design:paramtypes", [localization_service_1.default,
                util_ui_service_2.default])
        ], IzendaMessageComponent);
        return IzendaMessageComponent;
    }());
    exports.default = IzendaMessageComponent;
});
izendaRequire.define("common/core/components/notification/notification-component", ["require", "exports", "common/core/module-definition", "common/core/tools/izenda-component", "common/core/services/util-ui-service", "izenda-external-libs"], function (require, exports, module_definition_5, izenda_component_3, util_ui_service_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Notification component
     */
    var IzendaDialogBoxComponent = /** @class */ (function () {
        function IzendaDialogBoxComponent($izendaUtilUiService) {
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.notifications = $izendaUtilUiService.notifications;
        }
        /**
         * Close notification.
         * @param {object} notification Notification object.
         */
        IzendaDialogBoxComponent.prototype.closeNotification = function (notification) {
            this.$izendaUtilUiService.closeNotification(notification.id);
        };
        /**
         * Cancel notification autohide.
         * @param {object} notification Notification object.
         */
        IzendaDialogBoxComponent.prototype.cancelNotificationTimeout = function (notification) {
            this.$izendaUtilUiService.cancelNotificationTimeout(notification.id);
        };
        IzendaDialogBoxComponent = __decorate([
            izenda_component_3.default(module_definition_5.default, 'izendaNotificationComponent', ['$izendaUtilUiService'], {
                templateUrl: '###RS###extres=components.common.core.components.notification.notification-template.html',
                bindings: {}
            }),
            __metadata("design:paramtypes", [util_ui_service_3.default])
        ], IzendaDialogBoxComponent);
        return IzendaDialogBoxComponent;
    }());
    exports.default = IzendaDialogBoxComponent;
});
izendaRequire.define("common/core/module", ["require", "exports", "common/core/module-definition", "common/core/services/compatibility-service", "common/core/services/event-service", "common/core/services/localization-service", "common/core/services/util-service", "common/core/services/util-ui-service", "common/core/directives/bootstrap-modal", "common/core/directives/utility", "common/core/components/dialog-box/dialog-box-component", "common/core/components/message/message-component", "common/core/components/notification/notification-component"], function (require, exports, module_definition_6, compatibility_service_1, event_service_1, localization_service_2, util_service_1, util_ui_service_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // register services
    compatibility_service_1.default.register(module_definition_6.default);
    event_service_1.default.register(module_definition_6.default);
    localization_service_2.default.register(module_definition_6.default);
    util_service_1.default.register(module_definition_6.default);
    util_ui_service_4.default.register(module_definition_6.default);
});
izendaRequire.define("common/query/module-definition", ["require", "exports", "angular", "common/core/module"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var izendaQueryModule = angular.module('izenda.common.query', ['rx', 'izenda.common.core']);
    exports.default = izendaQueryModule;
});
izendaRequire.define("common/query/services/rs-query-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaRsQueryService = /** @class */ (function () {
        function IzendaRsQueryService($window, $http, $q, $injector, $izendaLocaleService, $izendaUtilUiService) {
            this.$window = $window;
            this.$http = $http;
            this.$q = $q;
            this.$injector = $injector;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.urlSettings = this.$window.urlSettings$;
            this.rsQueryBaseUrl = this.urlSettings.urlRsPage;
            this.requestList = new Array();
        }
        Object.defineProperty(IzendaRsQueryService, "injectModules", {
            get: function () {
                return ['$window', '$http', '$q', '$injector', '$izendaLocaleService', '$izendaUtilUiService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Custom query to the izenda response server
         * @param {any} queryParams Query parameters.
         * @param {any} options Query options.
         * @param {any} errorOptions Error options.
         * @param {boolean} invalidateInCacheParameter Do we need to invalidate caches.
         */
        IzendaRsQueryService.prototype.rsQuery = function (queryParams, options, errorOptions, invalidateInCacheParameter) {
            if (invalidateInCacheParameter === void 0) { invalidateInCacheParameter = false; }
            return this.customQuery(this.rsQueryBaseUrl, queryParams, options, errorOptions, invalidateInCacheParameter);
        };
        /**
         * Custom query to the izenda API.
         * @param {string} wsCmd Izenda API command.
         * @param {any[]} wsArgs Izenda API command parameters (wsarg0, wsarg1,...).
         * @param {any} options Query options.
         * @param {any} errorOptions Error options.
         * @param {boolean} invalidateInCacheParameter Do we need to invalidate caches.
         */
        IzendaRsQueryService.prototype.query = function (wsCmd, wsArgs, options, errorOptions, invalidateInCacheParameter) {
            if (invalidateInCacheParameter === void 0) { invalidateInCacheParameter = false; }
            // prepare params:
            var params = this.createQueryParametersObject(wsCmd, wsArgs);
            // set default error options if it is not defined:
            var currentErrorOptions = angular.isObject(errorOptions)
                ? errorOptions
                : {
                    handler: function (wsCmd2, wsArgs2) { return "Query: \"" + wsCmd2 + "\" [" + wsArgs2 + "] failed."; },
                    params: [wsCmd, wsArgs]
                };
            return this.rsQuery(params, options, currentErrorOptions, invalidateInCacheParameter);
        };
        /**
         * Query to the izenda API (POST request which returns JSON).
         * @param {string} wsCmd Izenda API command.
         * @param {any[]} wsArgs Izenda API command parameters (wsarg0, wsarg1,...).
         * @param {boolean} invalidateInCacheParameter Do we need to invalidate caches.
         */
        IzendaRsQueryService.prototype.apiQuery = function (wsCmd, wsArgs, invalidateInCacheParameter) {
            var _this = this;
            if (invalidateInCacheParameter === void 0) { invalidateInCacheParameter = false; }
            return this.$q(function (resolve, reject) {
                // check params:
                if (!angular.isString(wsCmd) || wsCmd === '') {
                    reject('Parameter error: wsCmd parameter should be non-empty string.');
                    return;
                }
                if (!angular.isArray(wsArgs)) {
                    reject('Parameter error: wsArgs parameter should be array.');
                    return;
                }
                // create params array
                var params = _this.createQueryParametersObject(wsCmd, wsArgs);
                // run query
                _this.rsQuery(params, { dataType: 'json', method: 'POST' }, null, invalidateInCacheParameter)
                    .then(function (result) { return resolve(result); }, function (error) { return reject(error); });
            });
        };
        /**
         * Cancel all running queries
         * @param {any} options (optional) options.cancelList may set custom queries to cancel.
         */
        IzendaRsQueryService.prototype.cancelAllQueries = function (options) {
            var opts = options || {};
            // queries which we can cancel
            var cancellableQueries = opts.hasOwnProperty('cancelList')
                ? opts['cancelList']
                : this.$injector.get('izenda.common.query.cancellableQueries');
            var count = this.requestList.length;
            var i = 0;
            while (i < this.requestList.length) {
                var request = this.requestList[0];
                var cancel = false;
                if (angular.isArray(cancellableQueries)) {
                    var requestUrl = request.url;
                    var requestParams = request.queryParamsFinal;
                    for (var j = 0; j < cancellableQueries.length; j++) {
                        var cancelRule = cancellableQueries[j];
                        if (angular.isString(cancelRule)) {
                            cancel = cancel || requestUrl.indexOf(cancelRule) >= 0;
                        }
                        else if (angular.isObject(cancelRule)) {
                            if ('wscmd' in cancelRule) {
                                cancel = cancel || requestUrl.indexOf("wscmd=" + cancelRule['wscmd']) >= 0;
                                cancel = cancel || requestParams.hasOwnProperty('wscmd') && requestParams['wscmd'] === cancelRule['wscmd'];
                            }
                        }
                        else {
                            throw "Unknown cancel rule: " + cancelRule;
                        }
                    }
                }
                if (cancel) {
                    request.canceller.resolve();
                    request.resolver.$izendaRsQueryCancelled = false;
                    this.requestList.splice(i, 1);
                }
                else {
                    i++;
                }
            }
            return count - i;
        };
        /**
         * Send post request and receive file attachment.
         * @param {string} method GET/POST
         * @param {string} url Url.
         * @param {any} parameters Url parameters dictionary.
         * @return {angular.IPromise<void>} Promise without parameters.
         */
        IzendaRsQueryService.prototype.downloadFileRequest = function (method, url, parameters) {
            return this.$q(function (resolve) {
                if (typeof (Blob) !== 'undefined') {
                    // post request for download the file
                    var xhr_1 = new XMLHttpRequest();
                    xhr_1.open(method, url, true);
                    xhr_1.responseType = 'arraybuffer';
                    var selfXhr_1 = xhr_1;
                    xhr_1.onload = function (evt) {
                        console.log('downloadFileRequest xhr.onload evt: ', evt);
                        if (selfXhr_1.status !== 200)
                            return;
                        var disposition = xhr_1.getResponseHeader('Content-Disposition');
                        var filename = '';
                        if (disposition && disposition.toLowerCase().indexOf('attachment') !== -1) {
                            var filenameRegex = /[Ff]ilename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                            var matches = filenameRegex.exec(disposition);
                            if (matches != null && matches[1])
                                filename = matches[1].replace(/['"]/g, '');
                        }
                        var type = xhr_1.getResponseHeader('Content-Type');
                        var blob = new Blob([selfXhr_1.response], { type: type });
                        if (typeof window.navigator.msSaveBlob !== 'undefined') {
                            // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. 
                            // These URLs will no longer resolve as the data backing the URL has been freed."
                            window.navigator.msSaveBlob(blob, filename);
                            resolve();
                        }
                        else {
                            var urlFunc_1 = window.URL || window['webkitURL'];
                            var downloadUrl = urlFunc_1.createObjectURL(blob);
                            if (filename) {
                                // use HTML5 a[download] attribute to specify filename
                                var linkElement = document.createElement('a');
                                // safari doesn't support this yet
                                if (typeof linkElement.download === 'undefined') {
                                    window.location.href = downloadUrl;
                                }
                                else {
                                    linkElement.href = downloadUrl;
                                    linkElement.target = '_blank';
                                    linkElement.download = filename;
                                    document.body.appendChild(linkElement);
                                    linkElement.click();
                                    document.body.removeChild(linkElement);
                                }
                            }
                            else {
                                window.location.href = downloadUrl;
                            }
                            setTimeout(function () {
                                urlFunc_1.revokeObjectURL(downloadUrl);
                                resolve();
                            }, 100); // cleanup
                        }
                    };
                    xhr_1.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    if (method.toLowerCase() === 'post')
                        xhr_1.send(angular.element.param(parameters || {}));
                    else if (method.toLowerCase() === 'get')
                        xhr_1.send();
                    else
                        throw "Unsupported request method: " + method;
                }
                else {
                    if (method.toLowerCase() === 'post') {
                        // old browser post request
                        var form = document.createElement('form');
                        form.action = url;
                        form.method = method;
                        form.target = '_blank';
                        if (parameters)
                            for (var key in parameters)
                                if (parameters.hasOwnProperty(key)) {
                                    var input = document.createElement('textarea');
                                    input.name = key;
                                    input.value = typeof parameters[key] === 'object' ? JSON.stringify(parameters[key]) : parameters[key];
                                    form.appendChild(input);
                                }
                        form.style.display = 'none';
                        document.body.appendChild(form);
                        form.submit();
                        document.body.removeChild(form);
                    }
                    else {
                        // old browser get request
                        var linkElement2 = document.createElement('a');
                        linkElement2.href = url;
                        linkElement2.target = '_blank';
                        document.body.appendChild(linkElement2);
                        linkElement2.click();
                        document.body.removeChild(linkElement2);
                    }
                    resolve();
                }
            });
        };
        /**
         * Do query to custom url
         */
        IzendaRsQueryService.prototype.customQuery = function (baseUrl, queryParams, options, errorOptions, invalidateInCacheParameter) {
            var _this = this;
            var queryParamsFinal = angular.copy(queryParams);
            // apply izendaPageId$
            if (typeof (window['izendaPageId$']) !== 'undefined')
                queryParamsFinal['izpid'] = window['izendaPageId$'];
            if (typeof (window['angularPageId$']) !== 'undefined')
                queryParamsFinal['anpid'] = window['angularPageId$'];
            var isPost = options && options.method === 'POST';
            var postData = {};
            var url = baseUrl;
            if (!isPost) {
                // GET request url:
                var kvStrings = [];
                for (var paramName in queryParamsFinal)
                    if (queryParamsFinal.hasOwnProperty(paramName))
                        kvStrings.push(paramName + "=" + encodeURIComponent(queryParamsFinal[paramName]));
                if (invalidateInCacheParameter)
                    kvStrings.push('iic=1');
                url += "?" + kvStrings.join('&');
            }
            else {
                // POST request params string:
                var postParamsString = 'urlencoded=true';
                for (var paramName in queryParamsFinal)
                    if (queryParamsFinal.hasOwnProperty(paramName))
                        postParamsString += "&" + paramName + "=" + encodeURIComponent(queryParamsFinal[paramName]);
                postData = {
                    data: postParamsString
                };
                if (invalidateInCacheParameter)
                    url += '?iic=1';
            }
            // create promises
            var canceler = this.$q.defer();
            var resolver = this.$q.defer();
            resolver['$izendaRsQueryCancelled'] = true;
            resolver['errorOptions'] = angular.isObject(errorOptions) ? errorOptions : null;
            // prepare request optinos
            var dataType = angular.isDefined(options) && angular.isString(options.dataType)
                ? options.dataType
                : 'text';
            var contentType = 'text/html';
            if (dataType === 'json')
                contentType = 'text/json';
            url = getAppendedUrl(url);
            var requestId = (+new Date).toString() + '_' + Math.floor(Math.random() * 1000000).toString(); // pseudo random UID.
            var reqHeaders = {};
            reqHeaders['Content-Type'] = contentType;
            var req = {};
            req.method = 'GET';
            req.url = url;
            req.headers = reqHeaders;
            req.timeout = canceler.promise;
            if (angular.isObject(options)) {
                angular.extend(req, options);
            }
            angular.extend(req, postData); // it is empty for http GET requests
            // custom
            req['requestId'] = requestId;
            req['queryParamsFinal'] = queryParamsFinal;
            // add request to requestList
            this.requestList.push(new RequestListItem(requestId, url, queryParamsFinal, canceler, resolver));
            // run query
            this.$http(req).then(function (response) {
                // handle success
                _this.removeRequest(response.config['requestId']);
                if (!angular.isObject(response)) {
                    // resolve non-object responses
                    resolver.resolve(response);
                    return;
                }
                // object response
                var data = response.data;
                if (angular.isObject(data) && angular.isString(data['izendaQueryStatus'])) {
                    // API query result
                    if (data['izendaQueryStatus'] === 'ok')
                        resolver.resolve(data['result']);
                    else if (data['izendaQueryStatus'] === 'error')
                        resolver.reject(data['error']);
                    else
                        resolver.reject('Unknown izendaQueryStatus: ' + data['izendaQueryStatus']);
                }
                else {
                    // Non-API json query result
                    resolver.resolve(data);
                }
            }, function (response) {
                // handle request error
                _this.removeRequest(response.config.requestId);
                var needToReject = true;
                var errorText;
                if (resolver['errorOptions'] != null) {
                    needToReject = false;
                    errorText = resolver['errorOptions'].handler.apply(response, resolver['errorOptions'].params ? resolver['errorOptions'].params : []);
                }
                else if (response.message)
                    errorText = response.message;
                else if (response.config)
                    errorText = _this.$izendaLocaleService.localeText('js_QueryFailed', 'Query failed') + ': ' + JSON.stringify(response.config);
                else
                    errorText = _this.$izendaLocaleService.localeText('localeVariable', 'An unknown error occurred.');
                if (resolver['$izendaRsQueryCancelled']) {
                    if (needToReject)
                        resolver.reject(errorText);
                    else
                        _this.$izendaUtilUiService.showErrorDialog(errorText);
                }
            });
            return resolver.promise;
        };
        /**
         * Remove request from array
         */
        IzendaRsQueryService.prototype.removeRequest = function (requestId) {
            var foundIndex = -1;
            var i = 0;
            while (foundIndex < 0 && i < this.requestList.length) {
                if (this.requestList[i].requestId === requestId) {
                    foundIndex = i;
                }
                i++;
            }
            if (foundIndex >= 0) {
                this.requestList.splice(foundIndex, 1);
            }
        };
        IzendaRsQueryService.prototype.createQueryParametersObject = function (wsCmd, wsArgs) {
            var params = {
                'wscmd': wsCmd
            };
            // add wsargN=... parameters into params variable.
            if (wsArgs && wsArgs.length)
                params = wsArgs.reduce(function (currentParams, wsArg, wsArgIdx) {
                    currentParams["wsarg" + wsArgIdx] = typeof (wsArg) !== 'undefined' && wsArg != null ? wsArg : '';
                    return currentParams;
                }, params);
            return params;
        };
        Object.defineProperty(IzendaRsQueryService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaRsQueryService.register = function (module) {
            module.constant('izenda.common.query.cancellableQueries', [{
                    wscmd: 'loadDashboardConfigNew' // load dashboard layout query
                }, {
                    wscmd: 'getDashboardCategoriesNew'
                }, {
                    wscmd: 'getDashboardTilePreviewNew' // load tile html query
                }, {
                    wscmd: 'getCrsSchedule'
                }, {
                    wscmd: 'getCrsShare'
                }])
                .service('$izendaRsQueryService', IzendaRsQueryService.injectModules.concat(IzendaRsQueryService));
        };
        return IzendaRsQueryService;
    }());
    exports.default = IzendaRsQueryService;
    var RequestListItem = /** @class */ (function () {
        function RequestListItem(requestId, url, queryParamsFinal, canceller, resolver) {
            this.requestId = requestId;
            this.url = url;
            this.queryParamsFinal = queryParamsFinal;
            this.canceller = canceller;
            this.resolver = resolver;
        }
        return RequestListItem;
    }());
    exports.RequestListItem = RequestListItem;
});
izendaRequire.define("common/common-module-definition", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        if (typeof search !== 'string' || search === '')
            return this;
        return target.split(search).join(replacement);
    };
    /**
     * requirejs module, which creates angular modules.
     * returns 'loadSettings' function, which could load settings for this module.
     */
    var IzendaCommonLoader = /** @class */ (function () {
        function IzendaCommonLoader() {
        }
        IzendaCommonLoader.loadSettings = function () {
            var deferredObject = angular.element.Deferred();
            var urlSettings = window.urlSettings$;
            var rsPageUrl = urlSettings.urlRsPage;
            var settingsUrl = rsPageUrl + '?wscmd=getCommonSettings';
            // load common settings:
            angular.element.get(settingsUrl, function (configJson) {
                var configObject = configJson;
                angular
                    .module('izenda.common.core')
                    .constant('$izendaCommonSettings', configObject);
                deferredObject.resolve();
            });
            return deferredObject.promise();
        };
        return IzendaCommonLoader;
    }());
    exports.IzendaCommonLoader = IzendaCommonLoader;
});
izendaRequire.define("common/query/services/settings-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateTimeFormat = /** @class */ (function () {
        function DateTimeFormat(longDate, longTime, shortDate, shortTime, timeFormatForInnerIzendaProcessing, // this time format used in method DateLocToUs for saving filters.
        showTimeInFilterPickers, defaultFilterDateFormat) {
            this.longDate = longDate;
            this.longTime = longTime;
            this.shortDate = shortDate;
            this.shortTime = shortTime;
            this.timeFormatForInnerIzendaProcessing = timeFormatForInnerIzendaProcessing;
            this.showTimeInFilterPickers = showTimeInFilterPickers;
            this.defaultFilterDateFormat = defaultFilterDateFormat;
        }
        return DateTimeFormat;
    }());
    exports.DateTimeFormat = DateTimeFormat;
    var IzendaQuerySettingsService = /** @class */ (function () {
        function IzendaQuerySettingsService($izendaUtilService, $izendaCommonSettings) {
            this.$izendaUtilService = $izendaUtilService;
            this.$izendaCommonSettings = $izendaCommonSettings;
            // initialize formats
            this.defaultDateFormat = new DateTimeFormat('dddd, MMMM DD, YYYY', 'h:mm:ss A', 'MM/DD/YYYY', 'h:mm A', 'HH:mm:ss', false, 'MM/DD/YYYY' + ($izendaCommonSettings.showTimeInFilterPickers ? ' HH:mm:ss' : ''));
            var format = this.defaultDateFormat;
            this.dateFormat = new DateTimeFormat(format.longDate, format.longTime, format.shortDate, format.shortTime, format.timeFormatForInnerIzendaProcessing, format.showTimeInFilterPickers, '');
            this.dateFormat.longDate = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.dateFormatLong);
            this.dateFormat.longTime = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.timeFormatLong);
            this.dateFormat.shortDate = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.dateFormatShort);
            this.dateFormat.shortTime = this.convertDotNetTimeFormatToMoment($izendaCommonSettings.timeFormatShort);
            this.dateFormat.showTimeInFilterPickers = $izendaCommonSettings.showTimeInFilterPickers;
            this.dateFormat.defaultFilterDateFormat = this.dateFormat.shortDate +
                ($izendaCommonSettings.showTimeInFilterPickers ? " " + this.dateFormat.longTime : '');
            // culture
            this.culture = $izendaCommonSettings.culture;
            if (this.culture.indexOf('-') > 0)
                this.culture = this.culture.substring(0, this.culture.indexOf('-'));
            // bulk csv
            this.bulkCsv = false;
            if (typeof $izendaCommonSettings.bulkCsv != 'undefined')
                this.bulkCsv = $izendaCommonSettings.bulkCsv;
            // category character
            this.categoryCharacter = '\\';
            if (typeof $izendaCommonSettings.categoryCharacter != 'undefined')
                this.categoryCharacter = $izendaCommonSettings.categoryCharacter;
        }
        Object.defineProperty(IzendaQuerySettingsService, "injectModules", {
            get: function () {
                return ['$izendaUtilService', '$izendaCommonSettings'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Default date formats
         * @returns {DateTimeFormat}
         */
        IzendaQuerySettingsService.prototype.getDefaultDateFormat = function () {
            return this.defaultDateFormat;
        };
        /**
         * Default format string (en-US). This format used for sending dates to the server.
         * @param {string} customDateFormatString. Alternative date format if required.
         */
        IzendaQuerySettingsService.prototype.getDefaultDateFormatString = function (customDateFormatString) {
            var showTime = this.$izendaCommonSettings.showTimeInFilterPickers;
            var timeFormatString = showTime ? ' ' + this.defaultDateFormat.timeFormatForInnerIzendaProcessing : '';
            var dateFormatString = this.defaultDateFormat.shortDate;
            if (angular.isString(customDateFormatString) && customDateFormatString.trim() !== '') {
                dateFormatString = customDateFormatString;
            }
            return dateFormatString + timeFormatString;
        };
        /**
         * Convert .net date time format string to momentjs format string.
         * @param {string} format .net format string
         * @returns {string} momentjs format string
         */
        IzendaQuerySettingsService.prototype.convertDotNetTimeFormatToMoment = function (format) {
            var converter = izenda.utils.date.formatConverter;
            return converter.convert(format, converter.dotNet, converter.momentJs);
        };
        /**
        * Get common settings
        */
        IzendaQuerySettingsService.prototype.getCommonSettings = function () {
            return this.$izendaCommonSettings;
        };
        /**
         * Get date format.
         */
        IzendaQuerySettingsService.prototype.getDateFormat = function () {
            return this.dateFormat;
        };
        /**
         * Get current page culture.
         */
        IzendaQuerySettingsService.prototype.getCulture = function () {
            return this.culture;
        };
        /**
         * Get "bulk csv" CSV export mode enabled.
         */
        IzendaQuerySettingsService.prototype.getBulkCsv = function () {
            return this.bulkCsv;
        };
        IzendaQuerySettingsService.prototype.getCategoryCharacter = function () {
            return this.categoryCharacter;
        };
        IzendaQuerySettingsService.prototype.getReportFullName = function (reportName, reportCategory) {
            var result = null;
            if (reportName) {
                result = '';
                if (!this.$izendaUtilService.isUncategorized(reportCategory))
                    result = reportCategory + this.getCategoryCharacter();
                result += reportName;
            }
            return result;
        };
        Object.defineProperty(IzendaQuerySettingsService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaQuerySettingsService.register = function (module) {
            module.service('$izendaSettingsService', IzendaQuerySettingsService.injectModules.concat(IzendaQuerySettingsService));
        };
        return IzendaQuerySettingsService;
    }());
    exports.default = IzendaQuerySettingsService;
});
izendaRequire.define("common/query/services/common-query-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * This service provides API query methods.
     */
    var IzendaCommonQueryService = /** @class */ (function () {
        function IzendaCommonQueryService($izendaRsQueryService, $izendaLocaleService) {
            this.$izendaRsQueryService = $izendaRsQueryService;
            this.$izendaLocaleService = $izendaLocaleService;
        }
        Object.defineProperty(IzendaCommonQueryService, "injectModules", {
            get: function () {
                return ['$izendaRsQueryService', '$izendaLocaleService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Used for refresh session timeout
         */
        IzendaCommonQueryService.prototype.ping = function () {
            return this.$izendaRsQueryService.query('ping', [], { dataType: 'text' });
        };
        /**
         * Create new dashboard report set and set it as CurrentReportSet
         */
        IzendaCommonQueryService.prototype.newDashboard = function () {
            var _this = this;
            return this.$izendaRsQueryService.query('newcrs', ['DashboardDesigner'], { dataType: 'json' }, {
                handler: function () { return _this.$izendaLocaleService.localeText('js_DashboardCreateError', 'Failed to create new dashboard'); },
                params: []
            });
        };
        /**
         * Check report set is exist. Returns promise with 'true' value if exists
         * @param {string} reportSetFullName Report set full name for check.
         */
        IzendaCommonQueryService.prototype.checkReportSetExist = function (reportSetFullName) {
            if (!angular.isString(reportSetFullName) || reportSetFullName.trim() === '')
                throw new Error('reportSetFullName should be non empty string');
            var errorText = this.$izendaLocaleService.localeText('js_DashboardCheckExistError', 'Failed to check dashboard exist');
            return this.$izendaRsQueryService.query('checkreportsetexists', [reportSetFullName], { dataType: 'text' }, {
                handler: function (name) { return errorText + ": " + name; },
                params: [reportSetFullName]
            });
        };
        /**
         * Set AdHocContext current report set
         * @param {string} reportSetFullName Report set full name for check.
         */
        IzendaCommonQueryService.prototype.setCrs = function (reportSetFullName) {
            var errorText = this.$izendaLocaleService.localeText('js_SetCrsError', 'Failed to set current report set');
            return this.$izendaRsQueryService.query('setcurrentreportset', [reportSetFullName], { dataType: 'text' }, {
                handler: function (name) { return errorText + ": " + name; },
                params: [reportSetFullName]
            });
        };
        /**
         * Get report list by category
         * @param {string} category category name.
         */
        IzendaCommonQueryService.prototype.getReportSetCategory = function (category) {
            var categoryStr = angular.isDefined(category)
                ? (category.toLowerCase() === this.$izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized').toLowerCase()
                    ? ''
                    : category)
                : '';
            var errorText = this.$izendaLocaleService.localeText('js_GetCategoryError', 'Failed to get reports for category');
            return this.$izendaRsQueryService.query('reportlistdatalite', [categoryStr], { dataType: 'json' }, {
                handler: function (name) { return errorText + ": " + name; },
                params: [category]
            });
        };
        /**
         * Get report parts
         * @param {string} reportFullName Report full name (xxx@aaa\bbb).
         */
        IzendaCommonQueryService.prototype.getReportParts = function (reportFullName) {
            var errorText = this.$izendaLocaleService.localeText('js_ReportPartsError', 'Failed to get report parts for report');
            return this.$izendaRsQueryService.query('reportdata', [reportFullName], { dataType: 'json' }, {
                handler: function (name) { return errorText + ": " + name; },
                params: [reportFullName]
            });
        };
        /**
         * Get data which needed for schedule
         * @param {number} clientTimezoneOffset Default timezone.
         */
        IzendaCommonQueryService.prototype.getScheduleData = function (clientTimezoneOffset) {
            return this.$izendaRsQueryService.query('getCrsSchedule', [String(clientTimezoneOffset)], { dataType: 'json' }, {
                handler: function () { return 'Failed to get schedule data'; },
                params: []
            });
        };
        /**
         * Get data which needed for schedule
         * @param {boolean} defaultShareConfig If true - share config will get from new empty reportset, false - from current report set.
         */
        IzendaCommonQueryService.prototype.getShareData = function (defaultShareConfig) {
            return this.$izendaRsQueryService.query('getCrsShare', [defaultShareConfig ? 'true' : 'false'], { dataType: 'json' }, {
                handler: function () { return 'Failed to get share data'; },
                params: []
            });
        };
        Object.defineProperty(IzendaCommonQueryService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaCommonQueryService.register = function (module) {
            module.service('$izendaCommonQueryService', IzendaCommonQueryService.injectModules.concat(IzendaCommonQueryService));
        };
        return IzendaCommonQueryService;
    }());
    exports.default = IzendaCommonQueryService;
});
izendaRequire.define("common/query/services/ping-service", ["require", "exports", "izenda-external-libs"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaPingService = /** @class */ (function () {
        function IzendaPingService($timeout, $izendaCommonQueryService) {
            this.$timeout = $timeout;
            this.$izendaCommonQueryService = $izendaCommonQueryService;
            this.minute = 60 * 1000;
            this.defaultTimeout = 15 * this.minute; // default timeout - 15 minutes.
            this.timeout = -1;
            this.pingTimer = null;
        }
        Object.defineProperty(IzendaPingService, "injectModules", {
            get: function () {
                return ['$timeout', '$izendaCommonQueryService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Stop ping queries
         */
        IzendaPingService.prototype.stopPing = function () {
            if (this.pingTimer !== null) {
                this.$timeout.cancel(this.pingTimer);
                this.pingTimer = null;
            }
        };
        /**
         * Make ping iteration and create timeout for next iteration.
         */
        IzendaPingService.prototype.ping = function () {
            var _this = this;
            // cancel previous timer:
            this.stopPing();
            // hint: start immediately if timeout variable wasn't set.
            this.pingTimer = this.$timeout(function () {
                _this.$izendaCommonQueryService.ping().then(function (data) {
                    // set timeout
                    _this.timeout = (data > 0)
                        ? Math.round(data * 0.75 * _this.minute)
                        : _this.defaultTimeout;
                    _this.ping();
                });
            }, this.timeout >= 0 ? this.timeout : 0);
        };
        /**
         * Start ping queries
         */
        IzendaPingService.prototype.startPing = function () {
            this.ping();
        };
        Object.defineProperty(IzendaPingService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaPingService.register = function (module) {
            module.service('$izendaPingService', IzendaPingService.injectModules.concat(IzendaPingService));
        };
        return IzendaPingService;
    }());
    exports.default = IzendaPingService;
});
izendaRequire.define("common/query/services/url-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaLocationModel = /** @class */ (function () {
        function IzendaLocationModel() {
            this.fullName = null;
            this.category = null;
            this.name = null;
            this.isNew = false;
        }
        IzendaLocationModel.fromJson = function (json) {
            var location = new IzendaLocationModel();
            location.fullName = json.fullName || null;
            location.category = json.category || null;
            location.name = json.name || null;
            location.isNew = !!json.isNew;
            return location;
        };
        return IzendaLocationModel;
    }());
    exports.IzendaLocationModel = IzendaLocationModel;
    var IzendaUrlService = /** @class */ (function () {
        function IzendaUrlService(rx, $window, $izendaSettingsService, $izendaPingService, $izendaUtilService) {
            var _this = this;
            this.rx = rx;
            this.$window = $window;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaPingService = $izendaPingService;
            this.$izendaUtilService = $izendaUtilService;
            this.settings = $window.urlSettings$;
            this.reportNameInfo = this.getLocation();
            this.location = new this.rx.BehaviorSubject(this.reportNameInfo);
            // subscribe on location change:
            window.onpopstate = function (event) {
                if (event.state && (event.state.rn || event.state.new)) {
                    _this.locationChangedHandler();
                }
            };
            // start ping
            this.$izendaPingService.startPing();
        }
        Object.defineProperty(IzendaUrlService, "injectModules", {
            get: function () {
                return ['rx',
                    '$window',
                    '$izendaSettingsService',
                    '$izendaPingService',
                    '$izendaUtilService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Set report name and category to location
         * @param {IzendaLocationModel} locationInfo location object
         */
        IzendaUrlService.prototype.setLocation = function (locationInfo) {
            if (!angular.isObject(locationInfo))
                throw new Error('"locationInfo" parameter should be object');
            // if is new
            if (locationInfo.isNew) {
                this.setUrl({ isNew: '1' }, { new: true });
                this.locationChangedHandler();
                return;
            }
            // navigate to existing report
            this.setUrl({ rn: locationInfo.fullName.replaceAll(' ', '+') }, { rn: locationInfo.fullName });
            this.locationChangedHandler();
        };
        /**
         * Change url if possible, otherwise reload the page with new url.
         * @param {any} params - url params object.
         * @param {any} additionalParams - additional params for pushState.
         */
        IzendaUrlService.prototype.setUrl = function (params, additionalParams) {
            var previousUrlParams = this.getUrlParams(window.location.href);
            var isRnOldExist = angular.isString(previousUrlParams.rn);
            var isRnNewExist = angular.isString(params.rn) && params.rn !== '';
            var rnOld = isRnOldExist ? 'rn=' + previousUrlParams.rn.replaceAll(' ', '+') : '';
            var rnNew = isRnNewExist ? 'rn=' + params.rn.replaceAll(' ', '+') : '';
            var isNewOldExist = angular.isString(previousUrlParams.isNew);
            var isNewNewExist = angular.isString(params.isNew);
            if (isRnOldExist && isRnNewExist && rnOld === rnNew)
                // same rn
                return;
            if (isNewOldExist && isNewNewExist)
                // same isNew
                return;
            if (isRnNewExist && isNewNewExist)
                throw 'Incorrect params: both "rn" and "isNew" defined.';
            var newPath = window.location.pathname;
            var newParams = window.location.search ? window.location.search : '?';
            if (isNewNewExist) {
                // go to new report
                // remove rn
                newParams = newParams.replaceAll(rnOld, '');
                newParams += (newParams.endsWith('?') ? '' : '&') + 'isNew=1';
            }
            else if (isRnNewExist) {
                // go to existing report
                // remove isNew
                newParams = newParams.replaceAll('isNew=1', '');
                if (isRnOldExist)
                    newParams = newParams.replaceAll(rnOld, rnNew);
                else
                    newParams += (newParams.endsWith('?') ? '' : '&') + rnNew;
            }
            newParams = newParams.replaceAll('?&', '?');
            newParams = newParams.replaceAll('&&', '&');
            // navigate new url
            var newUrl = newPath + newParams;
            if (this.$window.history && this.$window.history.pushState) {
                this.$window.history.pushState(additionalParams, document.title, newUrl);
            }
            else
                window.location.href = newUrl;
        };
        /**
         * Returns report full name (category delimiter: $izendaSettingsService.getCategoryCharacter())
         * @return {IzendaLocationModel} current location model.
         */
        IzendaUrlService.prototype.getLocation = function () {
            this.settings = new UrlSettings(); // retrieve current url settings
            var reportInfo = this.settings.reportInfo;
            // existing report
            if (reportInfo.fullName)
                return IzendaLocationModel.fromJson(reportInfo);
            // isNew
            var result = new IzendaLocationModel();
            result.isNew = reportInfo.isNew;
            return result;
        };
        ;
        /**
         * Set report name and category to location.
         * @param {string} fullName Report full name.
         */
        IzendaUrlService.prototype.setReportFullName = function (fullName) {
            this.setLocation({
                fullName: fullName,
                name: this.extractReportName(fullName),
                category: this.extractReportCategory(fullName),
                isNew: false
            });
        };
        ;
        /**
         * Go to "new"
         */
        IzendaUrlService.prototype.setIsNew = function () {
            this.setLocation({
                fullName: null,
                name: null,
                category: null,
                isNew: true
            });
        };
        ;
        /**
         * Handler, which reacts on page load and $location change.
         */
        IzendaUrlService.prototype.locationChangedHandler = function () {
            // update url settings object because url has changed
            this.settings = new UrlSettings();
            // cancel all current queries
            //const countCancelled = this.$izendaRsQueryService.cancelAllQueries();
            //if (countCancelled > 0)
            //	this.$log.debug(`>>> Cancelled ${countCancelled} queries`);
            // set current report set if location has changed
            var newLocationModel = this.getLocation();
            if (newLocationModel.fullName !== this.reportNameInfo.fullName || newLocationModel.isNew !== this.reportNameInfo.isNew) {
                this.reportNameInfo = newLocationModel;
                this.location.onNext(this.reportNameInfo);
            }
        };
        ;
        /**
         * Create filter parameters url part using current filterParameters from UrlSettings object.
         * @return {string} Url parameters string: '&p1=v1&p2=v2...&pN=vN'.
         */
        IzendaUrlService.prototype.getFilterParamsString = function () {
            var requestString = '';
            if (this.settings.filterParameters.length > 0) {
                for (var i = 0; i < this.settings.filterParameters.length; i++) {
                    var paramObject = this.settings.filterParameters[i];
                    requestString += "&" + paramObject[0] + "=" + encodeURIComponent(paramObject[1]);
                }
            }
            return requestString;
        };
        /**
         * Extract report name from category\report full name
         * @param {string} fullName Report full name.
         * @return {string} report name without category.
         */
        IzendaUrlService.prototype.extractReportName = function (fullName) {
            if (!angular.isString(fullName) || fullName === '')
                throw "Can't extract report name from object \"" + JSON.stringify(fullName) + "\" with type " + typeof (fullName);
            var parts = fullName.split(this.$izendaSettingsService.getCategoryCharacter());
            return parts[parts.length - 1];
        };
        /**
         * Extract report category from "category\report full name
         * @param {string} fullName Report full name.
         * @return {string} report category.
         */
        IzendaUrlService.prototype.extractReportCategory = function (fullName) {
            if (!angular.isString(fullName) || fullName === '')
                throw "Can't extract report category from object \"" + JSON.stringify(fullName) + "\" with type " + typeof (fullName);
            var reportFullNameParts = fullName.split(this.$izendaSettingsService.getCategoryCharacter());
            var category;
            if (reportFullNameParts.length >= 2)
                category = reportFullNameParts.slice(0, reportFullNameParts.length - 1).join(this.$izendaSettingsService.getCategoryCharacter());
            else
                category = this.$izendaUtilService.getUncategorized();
            return category;
        };
        ;
        /**
         * Extract report name, category, report set name for report part.
         * @param {string} fullName Report full name.
         * @return {any} report parts object.
         */
        IzendaUrlService.prototype.extractReportPartNames = function (fullName, isPartNameAtRight) {
            if (!angular.isString(fullName) || fullName === '')
                throw "Can't extract report part name from object \"" + JSON.stringify(fullName) + "\" with type " + typeof (fullName);
            var result = {
                reportPartName: null,
                reportFullName: fullName,
                reportSetName: null,
                reportName: null,
                reportCategory: null,
                reportNameWithCategory: null
            };
            // extract report part name
            var reportSetName = fullName;
            if (fullName.indexOf('@') >= 0) {
                var parts = fullName.split('@');
                if (!angular.isUndefined(isPartNameAtRight) && isPartNameAtRight) {
                    reportSetName = parts[0], result.reportPartName = parts[1];
                }
                else {
                    result.reportPartName = parts[0], reportSetName = parts[1];
                }
            }
            // collect results into one object:
            result.reportSetName = reportSetName;
            result.reportName = this.extractReportName(reportSetName);
            result.reportCategory = this.extractReportCategory(reportSetName);
            result.reportNameWithCategory = result.reportName;
            if (this.$izendaUtilService.isUncategorized(result.reportCategory))
                result.reportNameWithCategory =
                    result.reportCategory + this.$izendaSettingsService.getCategoryCharacter() + result.reportNameWithCategory;
            result.reportFullName = (result.reportPartName != null ? result.reportPartName + '@' : '') + result.reportSetName;
            return result;
        };
        /**
         * Get current report info object.
         */
        IzendaUrlService.prototype.getReportInfo = function () {
            return this.reportNameInfo;
        };
        IzendaUrlService.prototype.getUrlParams = function (url) {
            var urlObj = (typeof (angular.element['url']) === 'undefined') ? window.purl(url) : angular.element['url'](url);
            return urlObj.data.param.query;
        };
        Object.defineProperty(IzendaUrlService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaUrlService.register = function (module) {
            module.service('$izendaUrlService', IzendaUrlService.injectModules.concat(IzendaUrlService));
        };
        return IzendaUrlService;
    }());
    exports.default = IzendaUrlService;
});
izendaRequire.define("common/query/module", ["require", "exports", "angular", "common/query/module-definition", "common/query/services/rs-query-service", "common/query/services/settings-service", "common/query/services/common-query-service", "common/query/services/ping-service", "common/query/services/url-service"], function (require, exports, angular, module_definition_7, rs_query_service_1, settings_service_1, common_query_service_1, ping_service_1, url_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // register http provider
    module_definition_7.default.config(['$httpProvider', function ($httpProvider) {
            $httpProvider.defaults.transformResponse.push(function (responseData) {
                // convert $http response. We need to translate asp.net dates 
                // in string format '/Date(ticksNumber)/' to js Date objects (only for json response type):
                var regexDate = /^\/Date\(([-]{0,1}\d+)\)\/$/;
                var convertDateStringsToDates = function (input) {
                    if (!angular.isObject(input))
                        return;
                    for (var key in input) {
                        if (!input.hasOwnProperty(key))
                            continue;
                        var value = input[key];
                        if (angular.isString(value)) {
                            var match = value.match(regexDate);
                            if (angular.isArray(match) && match.length > 0) {
                                var milliseconds = parseInt(match[match.length - 1]);
                                if (!isNaN(milliseconds)) {
                                    input[key] = new Date(milliseconds);
                                }
                            }
                        }
                        else if (angular.isObject(value)) {
                            convertDateStringsToDates(value);
                        }
                    }
                };
                convertDateStringsToDates(responseData);
                return responseData;
            });
        }]);
    // register services
    rs_query_service_1.default.register(module_definition_7.default);
    settings_service_1.default.register(module_definition_7.default);
    common_query_service_1.default.register(module_definition_7.default);
    ping_service_1.default.register(module_definition_7.default);
    url_service_1.default.register(module_definition_7.default);
});
izendaRequire.define("common/ui/module-definition", ["require", "exports", "angular", "izenda-external-libs", "common/core/module", "common/query/module"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var izendaUiModule = angular
        .module('izenda.common.ui', ['rx', 'izenda.common.core', 'izenda.common.query'])
        .value('izenda.common.ui.reportNameInputPlaceholderText', ['js_Name', 'Name'])
        .value('izenda.common.ui.reportNameEmptyError', ['js_NameCantBeEmpty', 'Report name can\'t be empty.'])
        .value('izenda.common.ui.reportNameInvalidError', ['js_InvalidReportName', 'Invalid report name']);
    exports.default = izendaUiModule;
});
izendaRequire.define("common/core/models/select-item-model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * IzendaSelectItemModel class is used to provide uniform angular bindings style for <select>.
     */
    var IzendaSelectItemModel = /** @class */ (function () {
        function IzendaSelectItemModel(text, value, group, selected, enabled) {
            if (typeof (value) === 'undefined')
                throw new Error('value should be defined');
            this.text = text;
            this.value = value;
            this.group = group ? group : undefined;
            this.selected = selected ? selected : false;
            this.enabled = enabled ? enabled : true;
        }
        Object.defineProperty(IzendaSelectItemModel.prototype, "disabled", {
            get: function () {
                return !this.enabled;
            },
            enumerable: true,
            configurable: true
        });
        IzendaSelectItemModel.prototype.isEqual = function (testValue, isLowerCaseComparison) {
            if (testValue === null && this.value === null)
                return true;
            if (testValue === null || this.value === null)
                return false;
            return isLowerCaseComparison
                ? testValue.toLowerCase() === this.value.toLowerCase()
                : testValue === this.value;
        };
        IzendaSelectItemModel.prototype.isEqualWithItem = function (item, isLowerCaseComparison) {
            if (!item)
                return false;
            return this.isEqual(item.value, isLowerCaseComparison);
        };
        return IzendaSelectItemModel;
    }());
    exports.IzendaSelectItemModel = IzendaSelectItemModel;
});
izendaRequire.define("common/core/models/raw-model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
izendaRequire.define("common/core/models/share-model", ["require", "exports", "izenda-external-libs"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Model for the list of share rules.
     */
    var IzendaShareModel = /** @class */ (function () {
        function IzendaShareModel() {
            this.shareRules = new Array();
        }
        /**
         * Deserialize share rules. This method sets this.shareRules field.
         * @param {any[]} json Serialized share rules array.
         * @param {Core.IzendaSelectItemModel[]} availableRights Right model collection.
         * @param {Core.IzendaSelectItemModel[]} availableSubjects Subject model collection.
         */
        IzendaShareModel.prototype.fromJson = function (json, availableRights, availableSubjects) {
            if (!json) {
                this.shareRules = [];
                return;
            }
            this.shareRules = json.map(function (ruleJson) {
                var shareRule = new IzendaShareRuleModel();
                shareRule.fromJson(ruleJson, availableRights, availableSubjects);
                return shareRule;
            });
        };
        /**
         * Serialize current share rules to json object.
         * @return {any[]} array of serialized share rules.
         */
        IzendaShareModel.prototype.toJson = function () {
            var json = this.shareRules
                .filter(function (shareRule) { return shareRule.subject && shareRule.right; })
                .map(function (shareRule) { return shareRule.toJson(); });
            return json;
        };
        return IzendaShareModel;
    }());
    exports.IzendaShareModel = IzendaShareModel;
    /**
     * Model for subject-right pair.
     */
    var IzendaShareRuleModel = /** @class */ (function () {
        function IzendaShareRuleModel(subjects) {
            this.availableSubjects = new Array();
            this.right = null;
            this.subject = null;
            if (subjects)
                this.setAvailableSubjects(subjects, null);
        }
        IzendaShareRuleModel.prototype.setAvailableSubjects = function (subjects, subjectValue) {
            var subjValue = subjectValue
                ? subjectValue
                : this.subject
                    ? this.subject.value
                    : null;
            // update available subjects collection
            this.availableSubjects = subjects && subjects.length ? subjects.slice() : [];
            // update subject
            this.subject = null;
            if (subjValue !== null)
                this.subject = this.availableSubjects.find(function (s) { return s.value === subjValue; }) || null;
        };
        IzendaShareRuleModel.prototype.fromJson = function (json, rights, subjects) {
            // set right
            this.right = null;
            if (rights && rights.length)
                this.right = rights.find(function (r) { return json && r.value === json.right; }) || null;
            // set available subject
            this.setAvailableSubjects(subjects, json ? json.subject : null);
        };
        IzendaShareRuleModel.prototype.toJson = function () {
            if (!this.right && !this.subject)
                // you can face with this situation only if you call toJson directly for this class, 
                //because when you serialize collection, there is additional check for empty subject and right.
                return null;
            var json = {
                right: this.right.value,
                subject: this.subject.value
            };
            return json;
        };
        return IzendaShareRuleModel;
    }());
    exports.IzendaShareRuleModel = IzendaShareRuleModel;
});
izendaRequire.define("common/ui/services/share-service", ["require", "exports", "common/core/models/select-item-model", "common/core/models/share-model", "common/core/models/share-model", "izenda-external-libs"], function (require, exports, select_item_model_1, share_model_1, share_model_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Service used for store data in share control
     */
    var IzendaShareService = /** @class */ (function () {
        function IzendaShareService($q, $izendaCommonQueryService) {
            this.$q = $q;
            this.$izendaCommonQueryService = $izendaCommonQueryService;
            this.reset();
        }
        Object.defineProperty(IzendaShareService, "injectModules", {
            get: function () {
                return ['$q', '$izendaCommonQueryService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Add new empty share rule.
         */
        IzendaShareService.prototype.addNewShareRule = function () {
            var shareRuleModel = new share_model_2.IzendaShareRuleModel(this.subjects);
            this.shareModel.shareRules.push(shareRuleModel);
        };
        /**
         * Remove share rule
         * @param {Core.IzendaShareRuleModel} shareRule Share rule for removal.
         */
        IzendaShareService.prototype.removeShareRule = function (shareRule) {
            if (!shareRule)
                return;
            var idx = this.shareModel.shareRules.indexOf(shareRule);
            this.shareModel.shareRules.splice(idx, 1);
        };
        /**
         * Create current scheule config json for send to server.
         * @return {any} Raw model for sending to server.
         */
        IzendaShareService.prototype.getShareConfigForSend = function () {
            return this.shareModel.toJson();
        };
        /**
         * Set current share config.
         * @param {any} json Share model raw object.
         * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
         */
        IzendaShareService.prototype.setShareConfig = function (json) {
            var _this = this;
            var isDefaultConfig = !json;
            this.reset();
            return this.$q(function (resolve) {
                _this.fillShareConfigFromJson(json, isDefaultConfig).then(function () { return resolve(); });
            });
        };
        /**
         * Set share service state from the config object.
         * @param {any} json Share model raw object.
         * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
         */
        IzendaShareService.prototype.fillShareConfigFromJson = function (json, isDefaultConfig) {
            var _this = this;
            return this.$q(function (resolve) {
                _this.loadShareData().then(function () {
                    if (isDefaultConfig) {
                        json = [{
                                subject: 'Everyone',
                                right: 'None'
                            }];
                    }
                    _this.shareModel = new share_model_1.IzendaShareModel();
                    _this.shareModel.fromJson(json, _this.rights, _this.subjects);
                    resolve();
                });
            });
        };
        /**
         * Load share data and available values from server.
         * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
         */
        IzendaShareService.prototype.loadShareData = function () {
            var _this = this;
            return this.$q(function (resolve) {
                _this.$izendaCommonQueryService.getShareData().then(function (json) {
                    // fill available rights collection
                    _this.rights = json.Rights.map(function (rightJson) { return new select_item_model_1.IzendaSelectItemModel(rightJson.Text, rightJson.Value); });
                    // fill available subjects collection
                    _this.subjects = json.ShareWith.map(function (subjectJson) { return new select_item_model_1.IzendaSelectItemModel(subjectJson.Text, subjectJson.Value); });
                    resolve();
                });
            });
        };
        /**
         * Set default values.
         */
        IzendaShareService.prototype.reset = function () {
            this.rights = new Array();
            this.subjects = new Array();
            this.shareModel = new share_model_1.IzendaShareModel();
        };
        Object.defineProperty(IzendaShareService, "$inject", {
            /**
             * Angular dependencies
             */
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaShareService.register = function (module) {
            module.service('$izendaShareService', IzendaShareService.injectModules.concat(IzendaShareService));
        };
        return IzendaShareService;
    }());
    exports.default = IzendaShareService;
});
izendaRequire.define("common/core/models/schedule-model", ["require", "exports", "izenda-external-libs"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaScheduleModel = /** @class */ (function () {
        function IzendaScheduleModel() {
            this.date = new Date();
            this.email = null;
            this.recipients = '';
            this.repeat = null;
            this.timezone = null;
        }
        /**
         * Fill this object from server-side dto object.
         * @param {any} json dto object.
         * @param {Core.IzendaSelectItemModel[]} emailTypes Email type models collection.
         * @param {Core.IzendaSelectItemModel[]} repeatTypes Repeat type models collection.
         * @param {Core.IzendaSelectItemModel[]} timezones Timezone models collection.
         */
        IzendaScheduleModel.prototype.fromJson = function (json, emailTypes, repeatTypes, timezones) {
            // parse and set date
            if (json && json.dateString) {
                var dateString = json.dateString.trim();
                var momentDate = void 0;
                if (json.timeString) {
                    dateString += " " + json.timeString.trim();
                    momentDate = moment(dateString, 'YYYY-MM-DD HH:mm:ss');
                }
                else {
                    momentDate = moment(dateString, 'YYYY-MM-DD');
                }
                this.date = momentDate.isValid() ? momentDate._d : new Date();
            }
            else
                this.date = new Date();
            if (!this.date || this.date.getFullYear() <= 1900)
                this.date = new Date();
            // timezone
            this.timezone = timezones.length ? (timezones.find(function (tz) { return tz.selected; }) || timezones[0]) : null;
            if (json && json.timezoneId)
                this.timezone = timezones.find(function (tz) { return tz.value === json.timezoneId; }) || this.timezone;
            // email type
            this.email = emailTypes.length ? (emailTypes.find(function (e) { return e.selected; }) || emailTypes[0]) : null;
            // repeat type
            this.repeat = repeatTypes.length ? (repeatTypes.find(function (r) { return r.selected; }) || repeatTypes[0]) : null;
            // recipients
            this.recipients = json && json.recipients ? json.recipients : '';
        };
        /**
         * Create server-side dto object for this schedule model object.
         * @return {any} New json object.
         */
        IzendaScheduleModel.prototype.toJson = function () {
            var dateString = null;
            var timeString = null;
            if (this.date) {
                dateString = moment(this.date).format('YYYY-MM-DD');
                timeString = moment(this.date).format('HH:mm:ss');
            }
            var json = {
                dateString: dateString,
                timeString: timeString,
                recipients: this.recipients,
                email: this.email ? this.email.value : null,
                repeat: this.repeat ? this.repeat.value : null,
                timezoneId: this.timezone ? this.timezone.value : null
            };
            return json;
        };
        return IzendaScheduleModel;
    }());
    exports.IzendaScheduleModel = IzendaScheduleModel;
});
izendaRequire.define("common/ui/services/schedule-service", ["require", "exports", "common/core/models/schedule-model", "common/core/models/select-item-model", "izenda-external-libs"], function (require, exports, schedule_model_1, select_item_model_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaScheduleService = /** @class */ (function () {
        function IzendaScheduleService($q, $izendaCommonQueryService) {
            this.$q = $q;
            this.$izendaCommonQueryService = $izendaCommonQueryService;
            this.reset();
        }
        Object.defineProperty(IzendaScheduleService, "injectModules", {
            get: function () {
                return ['$q', '$izendaCommonQueryService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Create current scheule config json for send to server.
         * @return {any} Raw model for sending to server.
         */
        IzendaScheduleService.prototype.getScheduleConfigForSend = function () {
            return this.scheduleConfig.toJson();
        };
        /**
         * Set current schedule config.
         * @param {any} json schedule raw model.
         * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
         */
        IzendaScheduleService.prototype.setScheduleConfig = function (json) {
            var _this = this;
            this.reset();
            return this.$q(function (resolve) {
                _this.fillScheduleConfigFromJson(json).then(function () { return resolve(); });
            });
        };
        /**
         * Set schedule service state from the config object.
         * Schedule timezones, repeat types and others are supposed to be loaded.
         * @param {any} json schedule raw model.
         * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
         */
        IzendaScheduleService.prototype.fillScheduleConfigFromJson = function (json) {
            var _this = this;
            return this.$q(function (resolve) {
                // Load schedule collections.
                _this.loadScheduleData().then(function () {
                    // Fill schedule config from json after loading collections.
                    _this.scheduleConfig.fromJson(json, _this.sendEmailTypes, _this.repeatTypes, _this.timezones);
                    resolve();
                });
            });
        };
        /**
         * Load schedule data and available values from server
         * @return {Promise<any>} Promise without parameter and error fallback. // todo: think about error handling ?
         */
        IzendaScheduleService.prototype.loadScheduleData = function () {
            var _this = this;
            return this.$q(function (resolve) {
                // calculate current timezone std offset:
                var rightNow = new Date();
                var jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
                var temp = jan1.toGMTString();
                var jan2 = new Date(temp.substring(0, temp.lastIndexOf(' ')));
                var stdTimeOffset = (jan1.getTime() - jan2.getTime()) / (1000 * 60);
                // load schedule dictionaries:
                _this.$izendaCommonQueryService.getScheduleData(stdTimeOffset).then(function (json) {
                    _this.timezones = json.TimeZones.map(function (tz) {
                        var tzText = tz.Text ? tz.Text.replaceAll('&nbsp;', ' ') : '';
                        return new select_item_model_2.IzendaSelectItemModel(tzText, tz.Value, undefined, tz.Selected, tz.Enabled);
                    });
                    _this.sendEmailTypes = json.SendEmailList.map(function (eml) {
                        return new select_item_model_2.IzendaSelectItemModel(eml.Text, eml.Value, undefined, eml.Selected, eml.Enabled);
                    });
                    _this.repeatTypes = json.RepeatTypes.map(function (rt) {
                        return new select_item_model_2.IzendaSelectItemModel(rt.Text, rt.Value, undefined, rt.Selected, rt.Enabled);
                    });
                    resolve();
                });
            });
        };
        /**
         * Set default values.
         */
        IzendaScheduleService.prototype.reset = function () {
            this.scheduleConfig = new schedule_model_1.IzendaScheduleModel();
            this.timezones = [];
            this.sendEmailTypes = [];
            this.repeatTypes = [];
        };
        Object.defineProperty(IzendaScheduleService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaScheduleService.register = function (module) {
            module.service('$izendaScheduleService', IzendaScheduleService.injectModules.concat(IzendaScheduleService));
        };
        return IzendaScheduleService;
    }());
    exports.default = IzendaScheduleService;
});
izendaRequire.define("common/ui/directives/align-switcher", ["require", "exports", "angular", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Align switcher directive.
     */
    var IzendaAlignSwitcher = /** @class */ (function () {
        function IzendaAlignSwitcher() {
            this.restrict = 'AE';
            this.scope = {
                ngModel: '=',
                title: '@'
            };
            this.template = "<span class=\"izenda-common-align-switcher glyphicon\" ng-click=\"nextValue()\" ng-attr-title=\"title\" ng-class=\"alignShortcut\"></span>";
            IzendaAlignSwitcher.prototype.link = function ($scope, $element, attrs) {
                var itemsArray = ['L', 'M', 'R', 'J', ' '];
                var shortcuts = {
                    'L': 'glyphicon-align-left',
                    'M': 'glyphicon-align-center',
                    'J': 'glyphicon-align-center',
                    'R': 'glyphicon-align-right',
                    ' ': 'glyphicon-none'
                };
                var validateValue = function (model) {
                    if (angular.isUndefined(model))
                        return;
                    if (itemsArray.indexOf(model) < 0)
                        throw 'Unknown align value: ' + model;
                };
                var updateShortcut = function (model) { return $scope.alignShortcut = shortcuts[model]; };
                $scope.nextValue = function () {
                    var idx = itemsArray.indexOf($scope.ngModel);
                    if (idx < itemsArray.length - 1)
                        idx++;
                    else
                        idx = 0;
                    $scope.ngModel = itemsArray[idx];
                    updateShortcut($scope.ngModel);
                };
                //
                $scope.$parent.$watch(attrs.ngModel, function (newValue, oldValue) {
                    if (oldValue === newValue)
                        return;
                    validateValue(newValue);
                    updateShortcut(newValue);
                });
                validateValue($scope.ngModel);
                updateShortcut($scope.ngModel);
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaAlignSwitcher.factory = function () {
            var directive = function () { return new IzendaAlignSwitcher(); };
            directive.$inject = [];
            return directive;
        };
        return IzendaAlignSwitcher;
    }());
    module_definition_8.default.directive('izendaAlignSwitcher', [IzendaAlignSwitcher.factory()]);
});
izendaRequire.define("common/ui/directives/autocomplete", ["require", "exports", "angular", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Autocomplete directive. Uses "tagit". Applyed for <input izenda-autocomplete> element.
     */
    var IzendaAutocomplete = /** @class */ (function () {
        function IzendaAutocomplete() {
            this.restrict = 'A';
            this.require = 'ngModel';
            this.scope = {
                ngModel: '=',
                autocompleteItems: '=',
                updateAutocompleteItems: '&'
            };
            IzendaAutocomplete.prototype.link = function ($scope, $element) {
                /**
                 * Create array with autocomplete item texts
                 * @param {Array<object>} items.
                 * @returns {Array<string>}.
                 */
                var prepareSource = function (items) {
                    if (!angular.isArray(items) || !items.length)
                        return [];
                    return items
                        .filter(function (item) { return angular.isObject(item); })
                        .map(function (item) { return item['text']; });
                };
                // initialize component
                $element.val($scope.ngModel);
                $element['tagit']({
                    tagSource: function (req, responseFunction) {
                        if (!angular.isFunction($scope.updateAutocompleteItems))
                            return;
                        var possibleText = req.term.split(/,\s*/).pop();
                        // update suggested items:
                        $scope.updateAutocompleteItems({ arg0: possibleText }).then(function (newExistentValuesList) {
                            var items = prepareSource(newExistentValuesList);
                            var result = items
                                .filter(function (item) { return !!item && item != '...'; })
                                .map(function (item) { return item.replaceAll('#||#', ','); });
                            responseFunction(result);
                        });
                    },
                    caseSensitive: true,
                    allowDuplicates: false,
                    singleFieldDelimiter: jsResources.literalComma,
                    processValuesForSingleField: function (tags) { return tags.map(function (tag) { return tag.replaceAll(',', '#||#'); }); },
                    processValuesFromSingleField: function (tags) { return tags.map(function (tag) { return tag.replaceAll('#||#', ','); }); }
                });
                // add watchers
                $scope.$watch('ngModel', function (newValue) {
                    if (!newValue)
                        $element['tagit']('removeAll');
                });
                // destruction method
                $element.on('$destroy', function () {
                    $element['tagit']('removeAll');
                });
            };
        }
        IzendaAutocomplete.factory = function () {
            var directive = function () { return new IzendaAutocomplete(); };
            directive.$inject = [];
            return directive;
        };
        return IzendaAutocomplete;
    }());
    module_definition_9.default.directive('izendaAutocomplete', [IzendaAutocomplete.factory()]);
});
izendaRequire.define("common/ui/directives/bootstrap", ["require", "exports", "angular", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Collapsible container directive.
     */
    var IzendaBootstrapCollapse = /** @class */ (function () {
        function IzendaBootstrapCollapse($timeout) {
            this.$timeout = $timeout;
            this.restrict = 'A';
            this.scope = {
                collapsed: '=',
                useDelay: '=',
                onComplete: '&'
            };
            IzendaBootstrapCollapse.prototype.link = function ($scope, $element, attrs) {
                /**
                 * Invoke complete handler.
                 */
                var collapseCompleted = function (result) {
                    if (angular.isFunction($scope.onComplete)) {
                        $scope.onComplete({
                            collapsed: result
                        });
                    }
                };
                $element.addClass('collapse');
                if ($scope.collapsed)
                    $element.addClass('in');
                $element['collapse'](); // call bootstrap jquery_element.collapse() method.
                // add event collapse handlers
                $element.on('hidden.bs.collapse', function () { return collapseCompleted(true); });
                $element.on('shown.bs.collapse', function () { return collapseCompleted(false); });
                // watch for collapsed state change
                $scope.$watch('collapsed', function () {
                    if ($scope.useDelay)
                        $timeout(function () { return $element['collapse']($scope.collapsed ? 'hide' : 'show'); }, 1000);
                    else
                        $element['collapse']($scope.collapsed ? 'hide' : 'show');
                });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaBootstrapCollapse.factory = function () {
            var directive = function ($timeout) { return new IzendaBootstrapCollapse($timeout); };
            directive.$inject = ['$timeout'];
            return directive;
        };
        return IzendaBootstrapCollapse;
    }());
    module_definition_10.default.directive('izendaBootstrapCollapse', ['$timeout', IzendaBootstrapCollapse.factory()]);
    /**
     * Tooltip directive
     */
    var IzendaBootstrapTooltip = /** @class */ (function () {
        function IzendaBootstrapTooltip() {
            this.restrict = 'A';
            this.scope = {
                tooltipItems: '='
            };
            IzendaBootstrapTooltip.prototype.link = function ($scope, $element) {
                $scope.$watch('tooltipItems', function (newVal) {
                    if (!angular.isArray(newVal)) {
                        $element.attr('title', '');
                        return;
                    }
                    var result = '';
                    for (var i = 0; i < newVal.length; i++) {
                        if (newVal.length > 1)
                            result += i + '. ';
                        result += newVal[i].message + '<br/>';
                    }
                    $element.attr('title', result);
                    $element['tooltip']('hide')
                        .attr('data-original-title', newVal)
                        .tooltip('update');
                });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaBootstrapTooltip.factory = function () {
            return function () { return new IzendaBootstrapTooltip(); };
        };
        return IzendaBootstrapTooltip;
    }());
    module_definition_10.default.directive('izendaBootstrapTooltip', [IzendaBootstrapTooltip.factory()]);
    /**
     * Bootstrap dropdown directive
     */
    var IzendaBootstrapDropdown = /** @class */ (function () {
        function IzendaBootstrapDropdown($window) {
            this.$window = $window;
            this.restrict = 'E';
            this.transclude = true;
            this.scope = {
                opened: '=',
                attachToElement: '@',
                width: '@',
                height: '@',
                onOpen: '&',
                onClose: '&'
            };
            this.template = "<div class=\"dropdown\">\n\t<div class=\"dropdown-menu izenda-common-dropdown-strong-shadow dropdown-no-close-on-click\"\n\t\tng-click=\"$event.stopPropagation();\">\n\t\t<div class=\"izenda-common-dropdown-triangle\"></div>\n\t\t<div ng-style=\"{'width': width, 'height': height}\">\n\t\t\t<div ng-transclude></div>\n\t\t</div>\n\t</div>\n</div>";
            IzendaBootstrapDropdown.prototype.link = function ($scope, $element, attrs) {
                var id = ('' + Math.random()).substring(2);
                var scrollEventId = 'scroll.izendaBootstrapDropdown' + id;
                var resizeEventId = 'resize.izendaBootstrapDropdown' + id;
                var keyEventId = 'keyup.izendaBootstrapDropdown' + id;
                var $dropdown = $element.find('.dropdown');
                var $menu = $element.find('.dropdown-menu');
                $dropdown.find('.izenda-common-dropdown-triangle').on('click', function () { return close(); });
                angular.element($window).on(scrollEventId, function () { return close(); });
                angular.element($window).on(resizeEventId, function () { return close(); });
                angular.element($window).on(keyEventId, function (event) {
                    // esc button handler
                    if (event.keyCode == 27 && $scope.opened) {
                        close();
                    }
                });
                $scope.$watch('opened', function (newVal) {
                    if (newVal && !$dropdown.hasClass('open'))
                        open();
                    if (!newVal && $dropdown.hasClass('open'))
                        close();
                });
                function open() {
                    var $attachToElement = angular.element($scope.attachToElement);
                    var $tile = $attachToElement.closest('.iz-dash-tile');
                    $dropdown.addClass('open');
                    $menu.css('position', 'absolute');
                    $menu.css('z-index', 9999);
                    var left = $tile.width() - $menu.width() - 16;
                    var delta = 0;
                    if (left < 0) {
                        delta = -left;
                        left = 0;
                    }
                    var top = 44;
                    $menu.children('.izenda-common-dropdown-triangle').css('left', $menu.width() - delta - 58);
                    $menu.css({
                        left: left + 'px',
                        top: top + 'px'
                    });
                    if (angular.isFunction($scope.onOpen))
                        $scope.onOpen({});
                }
                function close() {
                    $dropdown.removeClass('open');
                    $menu.data('open', false);
                    $scope.opened = false;
                    if (angular.isFunction($scope.onClose))
                        $scope.onClose({});
                    $scope.$applyAsync();
                }
                // destruction method
                $element.on('$destroy', function () {
                    angular.element($window).off(scrollEventId);
                    angular.element($window).off(resizeEventId);
                    angular.element($window).off(keyEventId);
                });
            };
        }
        IzendaBootstrapDropdown.factory = function () {
            var directive = function ($window) { return new IzendaBootstrapDropdown($window); };
            directive.$inject = ['$window'];
            return directive;
        };
        return IzendaBootstrapDropdown;
    }());
    module_definition_10.default.directive('izendaBootstrapDropdown', ['$window', IzendaBootstrapDropdown.factory()]);
});
izendaRequire.define("common/ui/directives/color-picker", ["require", "exports", "angular", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Color picker directive. Requires "jquery-minicolors" jQuery plugin. Usage:
     * <izenda-color-picker ng-model="..."></izenda-color-picker>
     */
    var IzendaColorPicker = /** @class */ (function () {
        function IzendaColorPicker() {
            this.restrict = 'A';
            this.scope = {
                ngModel: '=',
                inline: '@',
                additionalClass: '@'
            };
            this.template = '<input class="minicolors form-control" ng-class="additionalClass"></input>';
            IzendaColorPicker.prototype.link = function ($scope, $element) {
                var $input = $element.find('input.minicolors');
                // watch active item changed
                $scope.$watch('ngModel', function (newVal, oldVal) {
                    if (newVal === oldVal)
                        return;
                    $input.val(newVal);
                    $input['minicolors']('value', newVal);
                });
                initializeControl();
                // destruction method
                $element.on('$destroy', function () {
                    $input['minicolors']('destroy');
                    $input.remove();
                });
                function initializeControl() {
                    $input['minicolors']('destroy');
                    $input.val($scope.ngModel);
                    $input['minicolors']({
                        inline: $scope.inline === 'true',
                        lettercase: 'lowercase',
                        theme: 'bootstrap',
                        color: $scope.color,
                        position: 'bottom right',
                        change: function (hex) {
                            var val = String($input.val());
                            if (val.match(/^#{0,1}[0-9a-f]{6}$/gi)) {
                                $scope.ngModel = hex;
                                angular.element('.iz-dash-background').css('background-color', hex);
                                $scope.$applyAsync();
                            }
                        }
                    });
                    $element.find('.minicolors-grid, .minicolors-slider').click(function (e) {
                        e.stopPropagation();
                        return false;
                    });
                }
            };
        }
        IzendaColorPicker.factory = function () {
            return function () { return new IzendaColorPicker(); };
        };
        return IzendaColorPicker;
    }());
    module_definition_11.default.directive('izendaColorPicker', [IzendaColorPicker.factory()]);
});
izendaRequire.define("common/ui/directives/datetime-picker", ["require", "exports", "angular", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Directive docs.
     */
    var IzendaDateTimePicker = /** @class */ (function () {
        function IzendaDateTimePicker($window, $timeout, $izendaLocaleService, $izendaCompatibilityService) {
            this.$window = $window;
            this.$timeout = $timeout;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.restrict = 'A';
            this.require = 'ngModel';
            this.scope = {
                model: '=ngModel',
                ngDisabled: '=',
                dateFormat: '=',
                locale: '=',
                datepart: '=',
                showAdditionalButtons: '@',
                htmlContainerSelector: '@',
                onChange: '&'
            };
            this.template = "<input type=\"text\" class=\"form-control\" />\n<span class=\"input-group-addon\">\n\t<span class=\"glyphicon-calendar glyphicon\"></span>\n</span>";
            // change template if resolution is too low
            if (this.$izendaCompatibilityService.isSmallResolution())
                this.template = '<div class="izenda-common-date-picker-inline"/>';
            IzendaDateTimePicker.prototype.link = function ($scope, $element, attrs, ngModelCtrl) {
                var uid = Math.floor(Math.random() * 1000000);
                var $input = $element.children('input,.izenda-common-date-picker-inline');
                var $btn = $element.children('.input-group-addon');
                var isSmallResolution = $izendaCompatibilityService.isSmallResolution();
                var getPicker = function () { return $input.data('DateTimePicker'); };
                /**
                 * Create new date object based on baseDate with updated from the newDate date or time or both.
                 * @param {Date} baseDate current date
                 * @param {Date} newDate updated date
                 * @param {string} datepart what part will be updated: '"date"|"time"|"datetime"'
                 */
                var getUpdatedDateValue = function (baseDate, newDate, datepart) {
                    if (!baseDate)
                        return new Date(newDate);
                    var currDate = new Date(baseDate);
                    if (datepart === 'datetime') {
                        currDate = new Date(newDate);
                    }
                    else if (datepart === 'date') {
                        currDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), baseDate.getHours(), baseDate.getMinutes(), baseDate.getSeconds(), 0);
                    }
                    else if (datepart === 'time') {
                        currDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), 0);
                    }
                    return currDate;
                };
                /**
                 * Set date to the picker
                 */
                var setDate = function (newDate) {
                    if (!newDate)
                        getPicker().date(null);
                    else if (angular.isDate(newDate))
                        getPicker().date(getUpdatedDateValue($scope.model, newDate, $scope.datepart));
                    else if (angular.isString(newDate))
                        getPicker().date(getUpdatedDateValue($scope.model, new Date(newDate), $scope.datepart));
                    else
                        throw "Unknown date type: " + typeof (newDate);
                };
                /**
                 * Enable/Disable picker
                 */
                var setDisabled = function (isDisabled) {
                    if (isDisabled)
                        getPicker().disable();
                    else
                        getPicker().enable();
                };
                /**
                 * Apply date format in the picker
                 */
                var setFormat = function (format) {
                    if (!angular.isString(format))
                        getPicker().format(false);
                    else
                        getPicker().format(format);
                };
                /**
                 * Apply locale in the picker
                 */
                var setLocale = function (locale) {
                    if (!angular.isString(locale))
                        return;
                    getPicker().locale(locale);
                };
                // create date picker config json
                var config = {};
                if ($scope.showAdditionalButtons === 'true') {
                    config = {
                        showTodayButton: true,
                        showClear: true
                    };
                }
                angular.extend(config, {
                    locale: $scope.locale,
                    inline: isSmallResolution,
                    widgetParent: isSmallResolution ? null : angular.element($scope.htmlContainerSelector),
                    toolbarPlacement: 'bottom',
                    widgetPositioning: {
                        vertical: 'bottom'
                    },
                    tooltips: {
                        today: $izendaLocaleService.localeText('js_GoToToday', 'Go to today'),
                        clear: $izendaLocaleService.localeText('js_ClearSelection', 'Clear selection'),
                        close: $izendaLocaleService.localeText('js_ClosePicker', 'Close the picker'),
                        selectMonth: $izendaLocaleService.localeText('js_SelectMonth', 'Select Month'),
                        prevMonth: $izendaLocaleService.localeText('js_PreviousMonth', 'Previous Month'),
                        nextMonth: $izendaLocaleService.localeText('js_NextMonth', 'Next Month'),
                        selectYear: $izendaLocaleService.localeText('js_SelectYear', 'Select Year'),
                        prevYear: $izendaLocaleService.localeText('js_PreviousYear', 'Previous Year'),
                        nextYear: $izendaLocaleService.localeText('js_NextYear', 'Next Year'),
                        selectDecade: $izendaLocaleService.localeText('js_SelectDecade', 'Select Decade'),
                        prevDecade: $izendaLocaleService.localeText('js_PreviousDecade', 'Previous Decade'),
                        nextDecade: $izendaLocaleService.localeText('js_NextDecade', 'Next Decade'),
                        prevCentury: $izendaLocaleService.localeText('js_PreviousCentury', 'Previous Century'),
                        nextCentury: $izendaLocaleService.localeText('js_NextCentury', 'Next Century')
                    }
                });
                // create picker
                $scope.dateTimePicker = $input['datetimepicker'](config);
                // date picker 'on show' handler
                $input.on('dp.show', function () {
                    if (isSmallResolution)
                        return;
                    var $widget = angular.element($scope.htmlContainerSelector + ' > .bootstrap-datetimepicker-widget');
                    $widget.show();
                    $widget.css({
                        top: $input.offset().top - $widget.parent().offset().top + $input.height() + 20,
                        left: $input.offset().left - $widget.parent().offset().left
                    });
                });
                // window resize handler
                angular.element($window).on('resize.dp' + uid, function () {
                    if (isSmallResolution)
                        return;
                    var $widget = angular.element($scope.htmlContainerSelector + ' > .bootstrap-datetimepicker-widget');
                    $widget.hide();
                    $timeout(function () { return $input.blur(); }, 10);
                });
                $btn.on('click', function () {
                    if (!$scope.ngDisabled)
                        $input.focus();
                });
                // watch variables:
                $scope.$watch('ngDisabled', function (newVal) { return setDisabled(newVal); });
                $scope.$watch('dateFormat', function (newVal) { return setFormat(newVal); });
                $scope.$watch('locale', function (newVal) { return setLocale(newVal); });
                // initialize values
                setDisabled($scope.ngDisabled);
                setFormat($scope.dateFormat);
                setLocale($scope.locale);
                if (ngModelCtrl) {
                    $scope.$watch('model', function (newVal) { return setDate(newVal); });
                    $timeout(function () {
                        ngModelCtrl.$render = function () { return setDate(ngModelCtrl.$viewValue); };
                    });
                    $input.on('dp.change', function (e) {
                        var newDateValue = e['date'] ? getUpdatedDateValue($scope.model, e['date'].toDate(), $scope.datepart) : null;
                        ngModelCtrl.$setViewValue(newDateValue);
                    });
                }
                // destruction method
                $element.on('$destroy', function () {
                    angular.element($window).off('resize.dp' + uid);
                    var picker = getPicker();
                    if (picker)
                        getPicker().destroy();
                });
            };
        }
        IzendaDateTimePicker.factory = function () {
            var directive = function ($window, $timeout, $izendaLocaleService, $izendaCompatibilityService) {
                return new IzendaDateTimePicker($window, $timeout, $izendaLocaleService, $izendaCompatibilityService);
            };
            directive.$inject = ['$window', '$timeout', '$izendaLocaleService', '$izendaCompatibilityService'];
            return directive;
        };
        return IzendaDateTimePicker;
    }());
    module_definition_12.default.directive('izendaDateTimePicker', ['$window', '$timeout', '$izendaLocaleService', '$izendaCompatibilityService', IzendaDateTimePicker.factory()]);
});
izendaRequire.define("common/ui/directives/report-viewer", ["require", "exports", "angular", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Directive docs.
     */
    var IzendaReportViewer = /** @class */ (function () {
        function IzendaReportViewer($rootScope, $timeout) {
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.restrict = 'AE';
            this.scope = {
                allowColReorder: '@',
                allowedColumnsForReorder: '=',
                reportSetOptions: '=',
                allowColRemove: '@',
                droppableAccept: '@',
                onReorder: '&',
                onHeaderClick: '&',
                onPagingClick: '&',
                onDragOver: '&',
                onRemove: '&',
                emptyText: '=',
                currentInsertColumnOrder: '=',
                htmlText: '='
            };
            this.template = "<div class=\"izenda-report-viewer\">\n\t<div class=\"html-container-placeholder hidden\"></div>\n\t<div class=\"html-container-loading\" style=\"display: none;\" ng-bind=\":: 'js_Loading' | izendaLocale: 'Loading...'\"></div>\n\t<div id=\"renderedReportDiv\" class=\"html-container\"></div>\n</div>";
            IzendaReportViewer.prototype.link = function ($scope, $element) {
                //////////////////////////////////////////////////////////////
                // apply tile html function
                var $htmlContainer = $element.find('.html-container');
                var $htmlContainerLoading = $element.find('.html-container-loading');
                var $htmlContainerPlaceholder = $element.find('.html-container-placeholder');
                /**
                 * Prepare report table
                 * @param {jquery object} $table
                 */
                var processReportTable = function () {
                    // prepare table
                    if (!IzendaReportViewer.isTableIsGood($scope.$table))
                        return;
                    IzendaReportViewer.addColReorderHandler($scope, $timeout, function ($from, $to, isVisualGroup) {
                        IzendaReportViewer.onReorder($scope, $from, $to, isVisualGroup);
                    });
                    // add other handlers
                    IzendaReportViewer.addDragHandlers($scope, $rootScope, $element);
                    IzendaReportViewer.addClickHandler($scope);
                    IzendaReportViewer.addColRemoveButtons($scope);
                    izenda.report.registerPostRenderHandlers();
                };
                /**
                 * Apply report content html
                 * @param {string} html
                 */
                var applyHtml = function (html) {
                    // show/hide loading indicator
                    if (html === null) {
                        $htmlContainer.hide();
                        $htmlContainerLoading.show();
                    }
                    else {
                        $htmlContainer.show();
                        $htmlContainerLoading.hide();
                    }
                    // empty result
                    if (typeof (html) !== 'string' || (html && typeof (html) === 'string' && html.trim() === '')) {
                        $htmlContainer.text($scope.emptyText);
                        return;
                    }
                    $htmlContainer.html(html);
                    // is paging enabled
                    IzendaReportViewer.preparePageLinks($scope, $htmlContainer);
                    IzendaReportViewer.preparePagingInput($scope, $htmlContainer);
                    IzendaReportViewer.prepareGoToRecordBtn($scope, $htmlContainer);
                    $scope.$table = $htmlContainer.find('table[name=reportTable],table.ReportTable');
                    if ($scope.$table.length > 0) {
                        // prepare report table
                        processReportTable();
                    }
                };
                // htmlText change handler
                $scope.$watch('htmlText', function (newVal) { return applyHtml(newVal); });
                // is dragging enabled handler
                $rootScope.$watch('isDraggingNow', function (newVal) {
                    if (!newVal) {
                        $htmlContainerPlaceholder.addClass('hidden');
                    }
                });
                // run
                applyHtml($scope.htmlText);
                //////////////////////////////////////////////////////////////
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        /**
         * Check is any kind of visual group applied.
         */
        IzendaReportViewer.isVgApplyed = function ($scope) {
            return angular.isObject($scope.reportSetOptions)
                ? $scope.reportSetOptions.isVgUsed
                : false;
        };
        /**
         * Check is applied AG or VGHierarchy.
         */
        IzendaReportViewer.isTableContainVgColumns = function ($scope) {
            return IzendaReportViewer.isVgApplyed($scope) &&
                ['AnalysisGrid', 'VGHierarchy'].indexOf($scope.reportSetOptions.vgStyle) >= 0;
        };
        /**
         * Calculate count of visual group column.
         */
        IzendaReportViewer.getCountOfVgColumns = function ($scope) {
            var countOfVgColumns = 0;
            if (IzendaReportViewer.isTableContainVgColumns($scope)) {
                var fieldsInTable = $scope.reportSetOptions.sortedActiveFields;
                countOfVgColumns = fieldsInTable.filter(function (field) { return field.isVgUsed; }).length;
            }
            return countOfVgColumns;
        };
        /**
         * Get fields which have own column in preview table
         * @returns {Array} array of field objects.
         */
        IzendaReportViewer.getColumnFields = function ($scope) {
            var fieldsInTable;
            if (IzendaReportViewer.isTableContainVgColumns($scope))
                fieldsInTable = $scope.reportSetOptions.sortedActiveFields;
            else
                fieldsInTable = $scope.reportSetOptions.sortedActiveFields.filter(function (field) { return !field.isVgUsed; });
            return fieldsInTable;
        };
        IzendaReportViewer.isTableIsGood = function ($table) {
            if (!$table)
                return false;
            // if no table headers - stop:
            var $tableHeader = $table.children('tbody').children('tr.ReportHeader');
            if ($tableHeader.length === 0)
                return false;
            // check if table contains visual groups:
            return true;
        };
        /**
         * Add col reorder handler.
         */
        IzendaReportViewer.addColReorderHandler = function ($scope, $timeout, onColumnReorderCompleted) {
            if ($scope.allowColReorder !== 'true')
                return;
            var bodyOnselectstartSave = String(angular.element(document.body).attr('onselectstart'));
            var bodyUnselectableSave = String(angular.element(document.body).attr('unselectable'));
            var disableTextSelection = function () {
                // jQuery doesn't support the element.text attribute in MSIE 8
                // http://stackoverflow.com/questions/2692770/style-style-textcss-appendtohead-does-not-work-in-ie
                var $style = angular.element('<style id="__disable_text_selection__" type="text/css">body { -ms-user-select:none;-moz-user-select:-moz-none;-khtml-user-select:none;-webkit-user-select:none;user-select:none; }</style>');
                angular.element(document.head).append($style);
                angular.element(document.body).attr('onselectstart', 'return false;').attr('unselectable', 'on');
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                else {
                    document.selection.empty(); // MSIE http://msdn.microsoft.com/en-us/library/ms535869%28v=VS.85%29.aspx
                }
            };
            var restoreTextSelection = function () {
                angular.element('#__disable_text_selection__').remove();
                if (bodyOnselectstartSave)
                    angular.element(document.body).attr('onselectstart', bodyOnselectstartSave);
                else
                    angular.element(document.body).removeAttr('onselectstart');
                if (bodyUnselectableSave)
                    angular.element(document.body).attr('unselectable', bodyUnselectableSave);
                else
                    angular.element(document.body).removeAttr('unselectable');
            };
            var createHelper = function (innerOffset) {
                var $cell = $scope.reorderState.$from;
                var $clone = $cell.clone().wrap('<div class="izenda-common-col-reorder-helper"></div>').parent();
                $clone.width($cell.outerWidth());
                $clone.height($cell.outerHeight());
                $clone.css('top', $cell.position().top);
                $clone.css('left', $cell.position().left + innerOffset);
                $scope.reorderState.$helper = $clone;
                $scope.reorderState.helperOffset = innerOffset;
                $scope.$table.append($clone);
                return $clone;
            };
            var removeHelper = function () {
                $scope.reorderState.$helper.remove();
            };
            var beforeReorderStarted = function () {
                disableTextSelection();
                $scope.reorderState.$from.addClass('izenda-reorder-cell-selected');
                $scope.reorderState.previousPosition = $scope.$table.css('position');
                $scope.$table.css('position', 'relative');
            };
            var afterReorderCompleted = function () {
                $scope.reorderState.$from.removeClass('izenda-reorder-cell-selected');
                $scope.reorderState.itemsCache = null;
                $scope.$table.css('position', $scope.reorderState.previousPosition);
                $scope.$table.find('.izenda-common-col-reorder-active').removeClass('izenda-col-reorder-active');
                removeHelper();
                restoreTextSelection();
            };
            var getCurrentItemsForReorder = function () {
                if (!$scope.reorderState.itemsCache) {
                    $scope.reorderState.itemsCache = $scope.reorderState.$from.parent().children();
                }
                return $scope.reorderState.itemsCache;
            };
            var completeReorder = function () {
                if (!$scope.reorderState.started)
                    return;
                $scope.reorderState.started = false;
                afterReorderCompleted();
                if (angular.isFunction(onColumnReorderCompleted)) {
                    var isVg = $scope.reorderState.$from.attr('data-is-vg-column') === 'true';
                    onColumnReorderCompleted($scope.reorderState.$from, $scope.reorderState.$to, isVg);
                }
            };
            $scope.reorderState = {
                started: false,
                $from: null
            };
            // add table handlers:
            angular.element(document).off('mousemove.izendaColReorder');
            angular.element(document).off('mouseup.izendaColReorder');
            angular.element(document).on('mousemove.izendaColReorder', function (e) {
                if (!$scope.reorderState.started)
                    return;
                var currentTableX = e.pageX - $scope.$table.offset().left;
                var isFromColumnVg = $scope.reorderState.$from.attr('data-is-vg-column') === 'true';
                // highlight current column
                var $tds = getCurrentItemsForReorder();
                var $toTd = null;
                angular.element.each($tds, function (iTd, td) {
                    var $currTd = angular.element(td);
                    var tdLeft = $currTd.position().left, tdWidth = $currTd.outerWidth();
                    var isTdColumnVg = String($currTd.attr('data-is-vg-column')) === 'true';
                    if (!$currTd.hasClass('izenda-col-reorder-disabled') &&
                        isFromColumnVg === isTdColumnVg &&
                        currentTableX >= tdLeft &&
                        currentTableX < tdLeft + tdWidth) {
                        $toTd = $currTd;
                    }
                });
                // is $toTd changed?
                if ($toTd && (!$scope.reorderState.$to || $toTd.index() !== $scope.reorderState.$to.index())) {
                    $scope.reorderState.$to = $toTd;
                    $tds.removeClass('izenda-common-col-reorder-active');
                    if (!$scope.reorderState.$to.hasClass('izenda-common-col-reorder-active')) {
                        $scope.reorderState.$to.addClass('izenda-common-col-reorder-active');
                    }
                    // bubble inner content
                    var fromIndex = $scope.reorderState.$from.index();
                    var toIndex = $scope.reorderState.$to.index();
                    angular.element.each($tds, function (iTd, td) {
                        var $currTd2 = angular.element(td);
                        var $backups = $currTd2.children('.izenda-common-col-reorder-hidden');
                        if ($backups.length > 0) {
                            $currTd2.children().not('.izenda-common-col-reorder-hidden').remove();
                        }
                        $currTd2.children().removeClass('izenda-common-col-reorder-hidden');
                    });
                    var $currentTd = void 0;
                    var $nextTd = void 0;
                    var i = void 0;
                    if (fromIndex < toIndex) {
                        for (i = fromIndex; i < toIndex; i++) {
                            $currentTd = angular.element($tds[i]);
                            $nextTd = angular.element($tds[i + 1]);
                            $currentTd.children().addClass('izenda-common-col-reorder-hidden');
                            $currentTd.append($nextTd.children().clone());
                        }
                    }
                    else {
                        for (i = fromIndex; i > toIndex; i--) {
                            $currentTd = angular.element($tds[i]);
                            $nextTd = angular.element($tds[i - 1]);
                            $currentTd.children().addClass('izenda-common-col-reorder-hidden');
                            $currentTd.append($nextTd.children().clone());
                        }
                    }
                }
                // move helper
                $scope.reorderState.$helper.css('left', currentTableX - $scope.reorderState.helperOffset);
            });
            angular.element(document).on('mouseup.izendaColReorder', function () {
                if ($scope.reorderState.downTimer)
                    $timeout.cancel($scope.reorderState.downTimer);
                completeReorder();
            });
            // initialize:
            var $headerRows = $scope.$table.find('tr.ReportHeader');
            // fieldsInTable should contain only fields which have column
            var fieldsInTable = IzendaReportViewer.getColumnFields($scope);
            angular.element.each($headerRows, function (iHeaderRow, tableHeader) {
                var $tableHeader = angular.element(tableHeader);
                if ($tableHeader.children('.EmptyCell').length > 0)
                    return;
                angular.element.each($tableHeader.children('td'), function (iCell, cell) {
                    var $cell = angular.element(cell);
                    if (iCell < fieldsInTable.length) {
                        if (IzendaReportViewer.isTableContainVgColumns($scope)) {
                            var field = fieldsInTable[iCell];
                            $cell.attr('data-is-vg-column', field.isVgUsed ? 'true' : 'false');
                        }
                        else {
                            $cell.attr('data-is-vg-column', 'false');
                        }
                        // mouse down handler
                        $cell.on('mousedown.izendaColReorder', function (e) {
                            $scope.reorderState.started = false;
                            if (e.which !== 1)
                                return;
                            if ($scope.reorderState.downTimer)
                                $timeout.cancel($scope.reorderState.downTimer);
                            $scope.reorderState.downTimer = null;
                            $scope.reorderState.$from = angular.element(e.delegateTarget);
                            $scope.reorderState.downTimer = $timeout(function () {
                                beforeReorderStarted();
                                createHelper(e.offsetX);
                                $scope.reorderState.started = true;
                            }, 250);
                        });
                    }
                    else {
                        $cell.addClass('izenda-col-reorder-disabled');
                    }
                });
            });
        };
        /**
         * Reorder completed handler
         * @param {jquery dom element} $from. Element which we dragged
         * @param {jquery dom element} $to. $from element dropped to this element.
         */
        IzendaReportViewer.onReorder = function ($scope, $from, $to, isVg) {
            if (!angular.isFunction($scope.onReorder))
                return;
            if (!$to || !$from)
                return;
            var fromIndex = $from.index();
            var toIndex = $to.index();
            if (fromIndex === toIndex)
                return;
            if (!isVg) {
                var vgColumnsCount = IzendaReportViewer.getCountOfVgColumns($scope);
                fromIndex -= vgColumnsCount;
                toIndex -= vgColumnsCount;
            }
            $scope.onReorder({ arg0: fromIndex, arg1: toIndex, arg2: isVg });
        };
        ;
        /**
         * Add drag handlers to table
         */
        IzendaReportViewer.addDragHandlers = function ($scope, $rootScope, $element) {
            var $htmlContainerPlaceholder = $element.find('.html-container-placeholder');
            // mouse over
            if (!angular.isString($scope.droppableAccept))
                return;
            var $currenttable = $scope.$table;
            var currentTableLeft = $currenttable.offset().left;
            $htmlContainerPlaceholder.height($currenttable.height());
            var columnCoords = [];
            var $currenttableHeader = $scope.$table.find('tr.ReportHeader').last();
            var fieldsInTable = IzendaReportViewer.getColumnFields($scope);
            var $currenttableRows = $currenttableHeader.children('td').slice(0, fieldsInTable.length);
            var countOfVgColumns = IzendaReportViewer.getCountOfVgColumns($scope);
            // calculate 
            angular.element.each($currenttableRows, function (iTh, th) {
                var $th = angular.element(th);
                if (iTh >= countOfVgColumns) {
                    columnCoords.push({
                        left: $th.position().left,
                        width: $th.outerWidth()
                    });
                }
            });
            // mouse enter handler
            $scope.$table.on('mouseenter', function () {
                if (!$rootScope.isDraggingNow)
                    return;
                currentTableLeft = $currenttable.offset().left;
                $htmlContainerPlaceholder.css('top', $currenttable.position().top + 'px');
                $htmlContainerPlaceholder.height($currenttable.height());
                if (columnCoords.length > 0)
                    $htmlContainerPlaceholder.css('left', columnCoords[0].left + 'px');
                $htmlContainerPlaceholder.removeClass('hidden');
            });
            // mouse leave handler
            $scope.$table.on('mouseleave', function () {
                if (!$rootScope.isDraggingNow)
                    return;
                if (event['toElement'] && angular.element(event['toElement']).hasClass('html-container-placeholder'))
                    return;
                $htmlContainerPlaceholder.addClass('hidden');
            });
            // mouse move handler
            $scope.$table.on('mousemove', function (event) {
                if (!$rootScope.isDraggingNow)
                    return;
                var left = event.pageX - currentTableLeft;
                for (var k = 0; k < columnCoords.length; k++) {
                    var column = columnCoords[k];
                    if (k < columnCoords.length - 1) {
                        var nextColumn = columnCoords[k + 1];
                        if (column.left <= left && left < nextColumn.left) {
                            if (left <= column.left + (nextColumn.left - column.left) / 2) {
                                $htmlContainerPlaceholder.css('left', column.left + 'px');
                                $scope.currentInsertColumnOrder = k;
                                $scope.$applyAsync();
                            }
                            else {
                                $htmlContainerPlaceholder.css('left', nextColumn.left + 'px');
                                $scope.currentInsertColumnOrder = k + 1;
                                $scope.$applyAsync();
                            }
                        }
                    }
                    else {
                        if (left >= column.left + column.width / 2) {
                            $htmlContainerPlaceholder.css('left', (column.left + column.width) + 'px');
                            $scope.currentInsertColumnOrder = k + 1;
                            $scope.$applyAsync();
                        }
                        else if (left >= column.left) {
                            $htmlContainerPlaceholder.css('left', (column.left) + 'px');
                            $scope.currentInsertColumnOrder = k;
                            $scope.$applyAsync();
                        }
                    }
                }
            });
        };
        ;
        /**
         * Add table header click handler
         */
        IzendaReportViewer.addClickHandler = function ($scope) {
            if (!angular.isFunction($scope.onHeaderClick))
                return;
            var $headerRows = $scope.$table.find('tr.ReportHeader');
            var fieldsInTable = IzendaReportViewer.getColumnFields($scope);
            angular.element.each($headerRows, function (iTableHeader, tableHeader) {
                var $tableHeader = angular.element(tableHeader);
                if ($tableHeader.children('.EmptyCell').length > 0)
                    return;
                // iterate header cells
                angular.element.each($tableHeader.children('td'), function (iCell, cell) {
                    var $cell = angular.element(cell);
                    if (iCell >= fieldsInTable.length)
                        return;
                    $cell.on('mousedown', function (e) {
                        if (e.which !== 1)
                            return;
                        if (!angular.isFunction($scope.onHeaderClick))
                            return;
                        var $this = angular.element(e.delegateTarget);
                        var fieldIndex = $this.index();
                        $scope.onHeaderClick({ arg0: fieldsInTable[fieldIndex] });
                    });
                });
            });
        };
        ;
        /**
         * Add buttons which allow to remvoe table columns
         */
        IzendaReportViewer.addColRemoveButtons = function ($scope) {
            if ($scope.allowColRemove !== 'true')
                return;
            var $headerRows = $scope.$table.find('tr.ReportHeader');
            var fieldsInTable = IzendaReportViewer.getColumnFields($scope);
            // iterate headers
            angular.element.each($headerRows, function (iHeaderRow, headerRow) {
                var $tableHeader = angular.element(headerRow);
                if ($tableHeader.children('.EmptyCell').length > 0)
                    return;
                // iterate header cells
                angular.element.each($tableHeader.children('td'), function (iCell, cell) {
                    var $cell = angular.element(cell);
                    $cell.css('position', 'relative');
                    if (iCell >= fieldsInTable.length)
                        return;
                    // add cell handlers
                    $cell.on('mouseover.removebtn', function (e) {
                        var $this = angular.element(e.delegateTarget);
                        $this.children('.izenda-common-remove-column-btn').show();
                    });
                    $cell.on('mouseout.removebtn', function (e) {
                        var $this = angular.element(e.delegateTarget);
                        $this.children('.izenda-common-remove-column-btn').hide();
                    });
                    // add button
                    var $reportColumnRemoveButton = angular.element('<div class="izenda-common-remove-column-btn"><span class="glyphicon glyphicon-remove"></span></div>');
                    $cell.append($reportColumnRemoveButton);
                    $reportColumnRemoveButton.on('mousedown.removebtn', function (e) {
                        if (e.which !== 1)
                            return;
                        e.stopImmediatePropagation();
                        if (!angular.isFunction($scope.onRemove))
                            return;
                        var fieldIndex = angular.element(e.delegateTarget).parent().index();
                        $scope.onRemove({ arg0: fieldsInTable[fieldIndex] });
                    });
                });
            });
        };
        ;
        /**
         * Remove 'onkeydown' event and add own keydown and blur events, which call onPagingClick handler.
         * @param {} $scope Current directive scope.
         * @param {} $htmlContainer Report container, which contains paging controls
         */
        IzendaReportViewer.preparePagingInput = function ($scope, $htmlContainer) {
            var $pageInputs = $htmlContainer.find('.iz-pagelink-exact-page-input');
            if (!$pageInputs.length)
                return;
            angular.element.each($pageInputs, function (iPageInput, pageInput) {
                var $pageInput = angular.element(pageInput);
                $pageInput.attr('onkeydown', null);
                // input changed handler
                var onInputChanged = function ($input) {
                    var pagesCount = parseInt(String($input.attr('data-pages-count')));
                    var itemsPerPage = parseInt(String($input.attr('data-items-per-page')));
                    var val = Number($input.val());
                    if (val < 1)
                        val = 1;
                    if (val > pagesCount)
                        val = pagesCount;
                    var startRecord = ((val - 1) * itemsPerPage) + 1;
                    var finishRecord = startRecord + itemsPerPage - 1;
                    $scope.onPagingClick({
                        arg0: 'iz-pagelink-exact-page-input',
                        arg1: startRecord + '-' + finishRecord
                    });
                };
                $pageInput.on('blur', function (event) {
                    var $this = angular.element(event.delegateTarget);
                    onInputChanged($this);
                });
                $pageInput.on('keydown', function (event) {
                    var kc = event.keyCode || event.which;
                    if (kc !== 13)
                        return;
                    var $this = angular.element(event.delegateTarget);
                    onInputChanged($this);
                });
            });
        };
        /**
         * Remove 'onclick' event and add own click event, which call onPagingClick handler.
         * @param {} $scope current Directive scope.
         * @param {} $htmlContainer Report container, which contains paging controls.
         */
        IzendaReportViewer.preparePageLinks = function ($scope, $htmlContainer) {
            var $pageLinks = $htmlContainer.find('.iz-pagelink, .iz-pagelink-direction-btn');
            if (!$pageLinks.length || !angular.isFunction($scope.onPagingClick))
                return;
            angular.element.each($pageLinks, function (iPageLink, pageLink) {
                var $pageLink = angular.element(pageLink);
                var onClickScript = String($pageLink.attr('onclick'));
                var matchResult = /results=(\d+\-\d+)/g.exec(onClickScript);
                if (matchResult && matchResult.length === 2)
                    $pageLink.attr('data-active-page', matchResult[1]);
                $pageLink.attr('onclick', null);
                $pageLink.on('click', function (e) {
                    var $currentLink = angular.element(e.delegateTarget);
                    $scope.onPagingClick({
                        arg0: 'iz-pagelink',
                        arg1: $currentLink.attr('data-active-page')
                    });
                });
            });
        };
        /**
         * Remove 'onclick' event and add own click event.
         * @param {} $scope current Directive scope.
         * @param {} $htmlContainer Report container, which contains paging controls.
         */
        IzendaReportViewer.prepareGoToRecordBtn = function ($scope, $htmlContainer) {
            var $btn = $htmlContainer.find('.iz-pagelink-go-to-page-btn');
            $btn.attr('onclick', null);
            $btn.on('click', function (e) {
                var $this = angular.element(e.delegateTarget);
                var itemsCount = parseInt(String($this.attr('data-items-count')));
                var itemsPerPage = parseInt(String($this.attr('data-items-per-page')));
                var inputValue;
                try {
                    inputValue = parseInt(String(angular.element('#pageNumEd').val()));
                }
                catch (e) {
                    inputValue = 1;
                }
                if (itemsCount < inputValue)
                    inputValue = itemsCount;
                var startRecord = inputValue - (inputValue - 1) % itemsPerPage;
                var finishRecord = startRecord + itemsPerPage - 1;
                $scope.onPagingClick({
                    arg0: 'iz-pagelink-exact-page-input',
                    arg1: startRecord + '-' + finishRecord
                });
            });
        };
        IzendaReportViewer.factory = function () {
            var directive = function ($rootScope, $timeout) {
                return new IzendaReportViewer($rootScope, $timeout);
            };
            directive.$inject = ['$rootScope', '$timeout'];
            return directive;
        };
        return IzendaReportViewer;
    }());
    module_definition_13.default.directive('izendaReportViewer', ['$rootScope', '$timeout', IzendaReportViewer.factory()]);
});
izendaRequire.define("common/ui/directives/select-checkboxes", ["require", "exports", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, module_definition_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Select checkboxes directive.
     */
    var IzendaSelectCheckboxes = /** @class */ (function () {
        function IzendaSelectCheckboxes() {
            this.restrict = 'AE';
            this.scope = {
                existentValues: '=',
                ngModel: '='
            };
            this.template = "<div ng-repeat=\"existentValue in existentValues\">\n\t<label class=\"izenda-common-select-checkboxes-label\">\n\t\t<input type=\"checkbox\" ng-click=\"clickCheckbox(existentValue)\" ng-checked=\"isChecked(existentValue)\"/>\n\t\t<span ng-bind=\"existentValue.text\"></span>\n\t</label>\n</div>";
            IzendaSelectCheckboxes.prototype.link = function ($scope, $element, attrs) {
                $element.addClass('izenda-common-select-checkboxes');
                $scope.$watch('existentValues', function () { return $scope.$parent.$eval(attrs.ngChange); }, true);
                $scope.$watchCollection('ngModel', function () { return $scope.$parent.$eval(attrs.ngChange); });
                $scope.isChecked = function (existentValue) {
                    var viewValue = $scope.ngModel;
                    return viewValue.indexOf(existentValue.value) >= 0;
                };
                $scope.clickCheckbox = function (existentValue) {
                    var viewValue = $scope.ngModel;
                    if (viewValue.indexOf(existentValue.value) >= 0)
                        viewValue.splice(viewValue.indexOf(existentValue.value), 1);
                    else
                        viewValue.push(existentValue.value);
                };
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaSelectCheckboxes.factory = function () {
            return function () { return new IzendaSelectCheckboxes(); };
        };
        return IzendaSelectCheckboxes;
    }());
    module_definition_14.default.directive('izendaSelectCheckboxes', [IzendaSelectCheckboxes.factory()]);
});
izendaRequire.define("common/ui/directives/splashscreen", ["require", "exports", "angular", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaSplashScreen = /** @class */ (function () {
        function IzendaSplashScreen($timeout, $izendaUrlService) {
            this.$timeout = $timeout;
            this.restrict = 'EA';
            this.scope = {
                ngShow: '=',
                text: '=',
                loadingIndicatorUrl: '@',
                parentSelector: '@'
            };
            IzendaSplashScreen.prototype.link = function ($scope) {
                var splashTimeout = null;
                var template = "<div class=\"izenda-common-splashscreen hidden\">\n\t<div class=\"izenda-common-splashscreen-inner text-center\">\n\t\t<img class=\"izenda-common-splashscreen-loading\"/>\n\t\t<span class=\"izenda-common-splashscreen-text\"></span>\n\t</div>\n</div>";
                var $element = angular.element(template);
                var added = false;
                // loading spinner
                var defaultLoadingIndicatorUrl = angular.isString($scope.loadingIndicatorUrl)
                    ? $scope.loadingIndicatorUrl
                    : $izendaUrlService.settings.urlRpPage + 'image=ModernImages.loading-grid.gif';
                var parentSelectorText = angular.isString($scope.parentSelector) ? $scope.parentSelector : 'body';
                var bodyOverflow;
                var bodyPadding;
                var $body;
                var initialize = function () {
                    $element.find('.izenda-common-splashscreen-loading').attr('src', defaultLoadingIndicatorUrl);
                    $body = angular.element(parentSelectorText);
                    if ($body.length > 0 && !added) {
                        bodyOverflow = $body.css('overflow');
                        bodyPadding = $body.css('padding-left');
                        $body.append($element);
                        added = true;
                    }
                };
                var setText = function () {
                    var $inner = $element.find('.izenda-common-splashscreen-text');
                    $inner.text($scope.text);
                };
                var bodyHasScrollbar = function () {
                    return $body.length > 0 && $body.get(0).scrollHeight > $body.height();
                };
                var showSplash = function () {
                    initialize();
                    if (splashTimeout !== null) {
                        $timeout.cancel(splashTimeout);
                        splashTimeout = null;
                    }
                    splashTimeout = $timeout(function () {
                        $element.removeClass('hidden');
                        bodyOverflow = $body.css('overflow');
                        $body.css('overflow', 'hidden');
                        if (bodyHasScrollbar()) {
                            bodyPadding = $body.css('padding-left');
                            $body.css('padding-right', '17px');
                        }
                    }, 1000);
                };
                var hideSplash = function () {
                    initialize();
                    if (splashTimeout !== null) {
                        $timeout.cancel(splashTimeout);
                        splashTimeout = null;
                        $element.addClass('hidden');
                        $body.css('overflow', bodyOverflow);
                        if (bodyHasScrollbar()) {
                            $body.css('padding-right', bodyPadding);
                        }
                    }
                };
                $scope.$watch('ngShow', function (newVal) {
                    if (newVal)
                        showSplash();
                    else
                        hideSplash();
                });
                $scope.$watch('text', function () { return setText(); });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaSplashScreen.factory = function () {
            var directive = function ($timeout, $izendaUrlService) { return new IzendaSplashScreen($timeout, $izendaUrlService); };
            directive.$inject = ['$timeout', '$izendaUrlService'];
            return directive;
        };
        return IzendaSplashScreen;
    }());
    module_definition_15.default.directive('izendaSplashScreen', ['$timeout', '$izendaUrlService', IzendaSplashScreen.factory()]);
});
izendaRequire.define("common/ui/directives/switcher", ["require", "exports", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, module_definition_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Switcher directive
     */
    var IzendaSwitcher = /** @class */ (function () {
        function IzendaSwitcher() {
            this.restrict = 'A';
            this.scope = {
                tooltip: '=',
                label: '=',
                ngModel: '='
            };
            this.template = "<span ng-show=\"label != null && label != ''\" class=\"izenda-common-switcher-label\">{{label}}</span>\n<span class=\"izenda-common-switcher\" title=\"{{tooltip}}\">\n\t<span class=\"izenda-common-switcher-text-off\">O</span>\n\t<span class=\"izenda-common-switcher-item\"></span>\n\t<span class=\"izenda-common-switcher-text-on\">I</span>\n</span>";
            IzendaSwitcher.prototype.link = function ($scope, $element) {
                $element.click(function (e) {
                    e.stopPropagation();
                    $scope.ngModel = !$scope.ngModel;
                    $scope.$parent.$apply();
                });
                var $switcher = $element.find('.izenda-common-switcher');
                $scope.$watch('ngModel', function (newVal) {
                    if (newVal)
                        $switcher.addClass('on');
                    else
                        $switcher.removeClass('on');
                });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaSwitcher.factory = function () {
            return function () { return new IzendaSwitcher(); };
        };
        return IzendaSwitcher;
    }());
    module_definition_16.default.directive('izendaSwitcher', [IzendaSwitcher.factory()]);
});
izendaRequire.define("common/ui/directives/toggle-button", ["require", "exports", "common/ui/module-definition", "izenda-external-libs"], function (require, exports, module_definition_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Toggle button directive
     */
    var IzendaToggleButton = /** @class */ (function () {
        function IzendaToggleButton() {
            this.restrict = 'EA';
            this.transclude = true;
            this.require = ['ngModel'];
            this.scope = {
                trueValue: '=',
                falseValue: '='
            };
            this.template = "<span type=\"button\" class=\"btn izenda-toggle-button-btn active\" data-toggle=\"button\">\n\t<ng-transclude></ng-transclude>\n</span>";
            IzendaToggleButton.prototype.link = function ($scope, $element, attrs, requiredParams) {
                var ngModel = requiredParams[0];
                var btn = $element.children('.btn');
                $scope.$parent.$watch(attrs.ngModel, function (newVal, oldVal) {
                    if (newVal === oldVal)
                        return;
                    if (newVal == $scope.trueValue) {
                        if (btn.hasClass('active')) {
                            btn.removeClass('active');
                            $scope.$parent.$eval(attrs.ngChange);
                        }
                    }
                    else if (newVal == $scope.falseValue) {
                        if (!btn.hasClass('active')) {
                            btn.addClass('active');
                            $scope.$parent.$eval(attrs.ngChange);
                        }
                    }
                });
                if (ngModel.$viewValue === $scope.trueValue) {
                    if (btn.hasClass('active')) {
                        btn.removeClass('active');
                    }
                }
                else if (ngModel.$viewValue === $scope.falseValue) {
                    if (!btn.hasClass('active')) {
                        btn.addClass('active');
                    }
                }
                $element.on('click', function () { return ngModel.$setViewValue(!ngModel.$viewValue); });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaToggleButton.factory = function () {
            return function () { return new IzendaToggleButton(); };
        };
        return IzendaToggleButton;
    }());
    module_definition_17.default.directive('izendaToggleButton', [IzendaToggleButton.factory()]);
});
izendaRequire.define("common/ui/components/schedule/schedule-component", ["require", "exports", "common/ui/module-definition", "common/core/tools/izenda-component", "common/core/services/localization-service", "common/query/services/settings-service", "common/ui/services/schedule-service", "izenda-external-libs"], function (require, exports, module_definition_18, izenda_component_4, localization_service_3, settings_service_2, schedule_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Schedule component definition
     */
    var IzendaScheduleComponent = /** @class */ (function () {
        function IzendaScheduleComponent($izendaLocaleService, $izendaSettingsService, $izendaScheduleService) {
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaScheduleService = $izendaScheduleService;
        }
        /**
         * Component init
         */
        IzendaScheduleComponent.prototype.$onInit = function () {
            this.dateFormat = this.$izendaSettingsService.dateFormat;
            this.culture = this.$izendaSettingsService.culture;
        };
        IzendaScheduleComponent = __decorate([
            izenda_component_4.default(module_definition_18.default, 'izendaScheduleComponent', ['$izendaLocaleService', '$izendaSettingsService', '$izendaScheduleService'], {
                templateUrl: '###RS###extres=components.common.ui.components.schedule.schedule-template.html',
                bindings: {
                    scheduleConfig: '=',
                    repeatTypes: '<',
                    emailTypes: '<',
                    timezones: '<'
                }
            }),
            __metadata("design:paramtypes", [localization_service_3.default,
                settings_service_2.default,
                schedule_service_1.default])
        ], IzendaScheduleComponent);
        return IzendaScheduleComponent;
    }());
    exports.default = IzendaScheduleComponent;
});
izendaRequire.define("common/ui/components/select-report/select-report-component", ["require", "exports", "angular", "common/ui/module-definition", "common/core/tools/izenda-component", "common/core/services/localization-service", "common/query/services/url-service", "common/query/services/settings-service", "common/query/services/common-query-service", "izenda-external-libs"], function (require, exports, angular, module_definition_19, izenda_component_5, localization_service_4, url_service_2, settings_service_3, common_query_service_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Select report component definition
     */
    var IzendaSelectReportComponent = /** @class */ (function () {
        function IzendaSelectReportComponent($timeout, $izendaLocaleService, $izendaUrlService, $izendaSettingsService, $izendaCommonQueryService) {
            this.$timeout = $timeout;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaCommonQueryService = $izendaCommonQueryService;
            this.uncategorizedText = this.$izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
            this.reset();
        }
        IzendaSelectReportComponent.prototype.$onChanges = function (changesObj) {
            var _this = this;
            if (!changesObj.opened)
                return;
            var currentOpened = changesObj.opened.currentValue;
            if (currentOpened) {
                this.reset();
                this.openedInner = true;
                // timeout is needed for the smoother modal animation
                this.$timeout(function () {
                    _this.hideAll = false;
                    _this.$izendaCommonQueryService.getReportSetCategory(_this.uncategorizedText).then(function (data) {
                        var reportSets = data.ReportSets;
                        _this.addCategoriesToModal(reportSets);
                        _this.addReportsToModal(reportSets);
                        _this.isLoading = false;
                    });
                }, 1000);
            }
        };
        /**
         * Add report parts to modal
         */
        IzendaSelectReportComponent.prototype.addReportPartsToModal = function (reportParts) {
            this.groups = [];
            if (!reportParts || !reportParts.length)
                return;
            // add groups:
            var currentGroup = [];
            for (var i = 0; i < reportParts.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    this.groups.push(currentGroup);
                    currentGroup = [];
                }
                var reportPart = reportParts[i];
                reportPart.isReportPart = true;
                currentGroup.push(reportPart);
            }
            this.groups.push(currentGroup);
        };
        /**
         * Add reportset categories to modal select control.
         */
        IzendaSelectReportComponent.prototype.addCategoriesToModal = function (reportSets) {
            var _this = this;
            if (!reportSets)
                return;
            this.categories = reportSets
                .filter(function (report) { return !report.Dashboard; })
                .map(function (report) {
                var category = report.Category ? report.Category : _this.uncategorizedText;
                return !report.Subcategory
                    ? category
                    : category + _this.$izendaSettingsService.getCategoryCharacter() + report.Subcategory;
            });
            // make categories unique
            this.categories = Array.from(new Set(this.categories));
            if (!this.category)
                this.category = this.uncategorizedText;
        };
        /**
         * Add report to modal dialog body.
         */
        IzendaSelectReportComponent.prototype.addReportsToModal = function (reportSets) {
            this.groups = [];
            var reportSetsToShow = [];
            if (reportSets && reportSets.length)
                reportSetsToShow = reportSets.filter(function (rs) { return !rs.Dashboard && rs.Name; });
            if (!reportSetsToShow || !reportSetsToShow.length)
                return;
            // add groups:
            var currentGroup = [];
            this.groups.length = 0;
            for (var i = 0; i < reportSetsToShow.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    this.groups.push(currentGroup);
                    currentGroup = [];
                }
                var reportSet = reportSetsToShow[i];
                reportSet.isReportPart = false;
                currentGroup.push(reportSet);
            }
            this.groups.push(currentGroup);
        };
        /**
         * Select category handler
         */
        IzendaSelectReportComponent.prototype.categoryChangedHandler = function () {
            var _this = this;
            if (this.isLoading)
                return;
            this.isLoading = true;
            this.groups = [];
            if (!this.category)
                this.category = this.uncategorizedText;
            this.$izendaCommonQueryService.getReportSetCategory(this.category).then(function (data) {
                _this.addReportsToModal(data.ReportSets);
                _this.isLoading = false;
            });
        };
        /**
         * Modal closed handler
         */
        IzendaSelectReportComponent.prototype.modalClosedHandler = function () {
            if (angular.isFunction(this.onModalClosed))
                this.onModalClosed({});
        };
        /**
         * User clicked to report set item
         */
        IzendaSelectReportComponent.prototype.itemSelectedHandler = function (item) {
            var _this = this;
            var isReportPart = item.isReportPart;
            var reportFullName = item.Name;
            if (item.CategoryFull)
                reportFullName = item.CategoryFull + this.$izendaSettingsService.getCategoryCharacter() + reportFullName;
            if (!isReportPart) {
                // if report set selected
                this.isLoading = true;
                this.groups = [];
                this.$izendaCommonQueryService.getReportParts(reportFullName).then(function (data) {
                    var reports = data.Reports;
                    _this.addReportPartsToModal(reports);
                    _this.isLoading = false;
                });
            }
            else {
                this.openedInner = false;
                // if report part selected
                if (angular.isFunction(this.onSelected))
                    this.onSelected({ reportPartInfo: item });
            }
        };
        /**
         * Reset form
         */
        IzendaSelectReportComponent.prototype.reset = function () {
            this.openedInner = false;
            this.category = this.uncategorizedText;
            this.categories = [];
            this.groups = [];
            this.isLoading = true;
            this.hideAll = true;
        };
        IzendaSelectReportComponent = __decorate([
            izenda_component_5.default(module_definition_19.default, 'izendaSelectReportComponent', ['$timeout', '$izendaLocaleService', '$izendaUrlService', '$izendaSettingsService', '$izendaCommonQueryService'], {
                templateUrl: '###RS###extres=components.common.ui.components.select-report.select-report-template.html',
                bindings: {
                    opened: '<',
                    onSelected: '&',
                    onModalClosed: '&'
                }
            }),
            __metadata("design:paramtypes", [Function, localization_service_4.default,
                url_service_2.default,
                settings_service_3.default,
                common_query_service_2.default])
        ], IzendaSelectReportComponent);
        return IzendaSelectReportComponent;
    }());
    exports.default = IzendaSelectReportComponent;
});
izendaRequire.define("common/ui/components/select-report-name/select-report-name-component", ["require", "exports", "angular", "common/ui/module-definition", "common/core/tools/izenda-component", "common/core/services/localization-service", "common/query/services/url-service", "common/query/services/settings-service", "common/query/services/common-query-service", "izenda-external-libs"], function (require, exports, angular, module_definition_20, izenda_component_6, localization_service_5, url_service_3, settings_service_4, common_query_service_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Select report name component definition
     */
    var IzendaSelectReportNameComponent = /** @class */ (function () {
        function IzendaSelectReportNameComponent($q, $izendaLocaleService, $izendaUrlService, $izendaSettingsService, $izendaCommonQueryService, reportNameInputPlaceholderText, reportNameEmptyError, reportNameInvalidError) {
            this.$q = $q;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaCommonQueryService = $izendaCommonQueryService;
            this.reportNameEmptyError = reportNameEmptyError;
            this.reportNameInvalidError = reportNameInvalidError;
            // other
            this.nextId = 1;
            this.isCategoryAllowed = $izendaSettingsService.getCommonSettings().showCategoryTextboxInSaveDialog;
            this.reportNameInputPlaceholderText = this.$izendaLocaleService
                .localeText(reportNameInputPlaceholderText[0], reportNameInputPlaceholderText[1]);
            this.textCreateNew = $izendaLocaleService.localeText('js_CreateNew', 'Create New');
            this.textUncategorized = $izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
            this.textErrorReportNameEmpty = $izendaLocaleService.localeText(reportNameEmptyError[0], reportNameEmptyError[1]);
            this.textErrorInvalidReportName = $izendaLocaleService.localeText(reportNameInvalidError[0], reportNameInvalidError[1]);
            this.textErrorInvalidCategoryName = $izendaLocaleService.localeText('js_InvalidCategoryName', 'Invalid Category Name');
            this.isOpenedInner = false;
            this.isNewReportDialog = false;
            this.reportName = '';
            this.isCreatingNewCategory = false;
            this.newCategoryName = '';
            this.categories = [];
            this.selectedCategory = null;
            this.isSelectDisabled = true;
            this.reportSets = [];
            this.errorMessages = [];
            this.isNameFocused = false;
            this.isCategoryFocused = false;
        }
        IzendaSelectReportNameComponent.prototype.$onChanges = function (changesObj) {
            if (changesObj.opened) {
                var currentOpened = changesObj.opened.currentValue;
                if (currentOpened)
                    this.openModal();
            }
        };
        /**
         * Modal closed handler
         */
        IzendaSelectReportNameComponent.prototype.modalClosedHandler = function () {
            if (angular.isFunction(this.onModalClosed))
                this.onModalClosed({});
        };
        /**
         * Close modal dialog
         */
        IzendaSelectReportNameComponent.prototype.closeModal = function () {
            this.isOpenedInner = false;
        };
        /**
         * Open modal dialog
         */
        IzendaSelectReportNameComponent.prototype.openModal = function () {
            var _this = this;
            this.isSelectDisabled = true;
            this.isOpenedInner = true;
            this.resetForm();
            var reportInfo = this.$izendaUrlService.getReportInfo();
            this.nextId = 1;
            // show loading message inside select control
            this.categories = [];
            this.categories.push({
                id: -1,
                name: this.$izendaLocaleService.localeText('js_Loading', 'Loading...')
            });
            this.selectedCategory = this.categories[0];
            this.reportName = reportInfo.name;
            this.$izendaCommonQueryService.getReportSetCategory(this.textUncategorized).then(function (data) {
                _this.categories = [];
                _this.selectedCategory = null;
                _this.reportSets = data.ReportSets;
                // add categories
                // "Create new"
                if (_this.$izendaSettingsService.getCommonSettings().allowCreateNewCategory)
                    _this.categories.push({
                        id: _this.nextId++,
                        name: _this.textCreateNew
                    });
                // "Uncategorized"
                _this.categories.push({
                    id: _this.nextId++,
                    name: _this.textUncategorized
                });
                _this.selectedCategory = _this.getCategoryObjectByName(_this.textUncategorized);
                // Other categories
                if (angular.isArray(_this.reportSets)) {
                    _this.reportSets.forEach(function (report) {
                        var id = _this.nextId++;
                        var currentCategoryName = report.Category;
                        if (!currentCategoryName)
                            currentCategoryName = _this.textUncategorized;
                        currentCategoryName = !report.Subcategory
                            ? currentCategoryName
                            : currentCategoryName + _this.$izendaSettingsService.getCategoryCharacter() + report.Subcategory;
                        if (_this.categories && _this.categories.length) {
                            if (!_this.categories.find(function (c) { return c.name === currentCategoryName; })) {
                                // if have't already added
                                var cat = {
                                    id: id,
                                    name: currentCategoryName
                                };
                                _this.categories.push(cat);
                                if (reportInfo.category === currentCategoryName) {
                                    _this.selectedCategory = cat;
                                }
                            }
                        }
                    });
                }
                _this.isSelectDisabled = false;
            });
        };
        /**
         * "Enter" button key press handler for report name <input>
         * @param {event object} $event.
         */
        IzendaSelectReportNameComponent.prototype.reportNameKeyPressed = function ($event) {
            if ($event.keyCode === 13 /* Enter */)
                this.completeHandler();
        };
        /**
         * OK button pressed
         */
        IzendaSelectReportNameComponent.prototype.completeHandler = function () {
            var _this = this;
            this.validateForm().then(function () {
                _this.closeModal();
                var categoryName = _this.isCreatingNewCategory ? _this.newCategoryName : _this.selectedCategory.name;
                if (angular.isFunction(_this.onSelected)) {
                    _this.onSelected({
                        reportName: _this.reportName,
                        categoryName: categoryName
                    });
                }
            }, function () { });
        };
        /**
         * Get report with given name from report list
         * @param {string} report name.
         * @param {Array} list with reports.
         */
        IzendaSelectReportNameComponent.prototype.isReportInReportList = function (reportName, reportList) {
            if (!reportList || !reportList.length)
                return false;
            return reportList.find(function (rs) { return rs.Name === reportName.trim(); });
        };
        /**
         * Set form to it's initial state
         */
        IzendaSelectReportNameComponent.prototype.resetForm = function () {
            var reportInfo = this.$izendaUrlService.getReportInfo();
            this.errorMessages = [];
            this.isCreatingNewCategory = false;
            this.newCategoryName = '';
            this.categories = [];
            this.selectedCategory = null;
            this.isSelectDisabled = true;
            this.reportSets = [];
            this.isNameFocused = false;
            this.isCategoryFocused = false;
            if (this.isNewReportDialog) {
                this.reportName = '';
            }
            else {
                var separatorIndex = (reportInfo && reportInfo.name)
                    ? reportInfo.name.lastIndexOf(this.$izendaSettingsService.getCategoryCharacter())
                    : -1;
                this.reportName = (separatorIndex < 0) ? reportInfo.name : reportInfo.name.substr(separatorIndex + 1);
            }
        };
        /**
         * Clear all focus
         */
        IzendaSelectReportNameComponent.prototype.clearFocus = function () {
            this.isNameFocused = false;
            this.isCategoryFocused = false;
        };
        /**
         * Set focus on report name input
         */
        IzendaSelectReportNameComponent.prototype.setFocus = function () {
            this.isNameFocused = true;
        };
        /**
         * Categories were updated.
         */
        IzendaSelectReportNameComponent.prototype.updateCategoriesHandler = function (newCategories) {
            var _this = this;
            this.categories = newCategories.map(function (newCategoryName) {
                return {
                    id: _this.nextId++,
                    name: newCategoryName
                };
            });
            var selectedCategoryName = this.selectedCategory ? this.selectedCategory.name : null;
            this.selectedCategory = this.getCategoryObjectByName(selectedCategoryName);
        };
        /**
         * Report category selected handler
         */
        IzendaSelectReportNameComponent.prototype.categorySelectedHandler = function (category) {
            if (!this.isCategoryAllowed) {
                this.selectedCategory = this.getCategoryObjectByName(this.textUncategorized);
                return;
            }
            this.selectedCategory = this.getCategoryObjectByName(category);
            if (this.selectedCategory !== null) {
                if (this.selectedCategory.name === this.textCreateNew) {
                    this.isCreatingNewCategory = true;
                    this.clearFocus();
                    this.isCategoryFocused = true;
                }
                else {
                    this.isCreatingNewCategory = false;
                }
            }
            else {
                this.isCreatingNewCategory = false;
            }
        };
        /**
         * Validate form
         */
        IzendaSelectReportNameComponent.prototype.validateForm = function () {
            var _this = this;
            return this.$q(function (resolve, reject) {
                // check report name not empty
                _this.errorMessages.length = 0;
                _this.reportName = angular.isString(_this.reportName) ? _this.reportName.trim() : '';
                if (!_this.reportName) {
                    _this.errorMessages.push(_this.textErrorReportNameEmpty);
                    reject();
                    return false;
                }
                // check report name is valid
                var settings = _this.$izendaSettingsService.getCommonSettings();
                var reportNameFixed = window.utility.fixReportNamePath(_this.reportName, _this.$izendaSettingsService.getCategoryCharacter(), settings.stripInvalidCharacters, settings.allowInvalidCharacters);
                if (!reportNameFixed) {
                    _this.errorMessages.push(_this.textErrorInvalidReportName);
                    reject();
                    return false;
                }
                _this.reportName = reportNameFixed;
                // check category
                if (_this.isCreatingNewCategory) {
                    var fixedCategoryName = window.utility.fixReportNamePath(_this.newCategoryName, _this.$izendaSettingsService.getCategoryCharacter(), settings.stripInvalidCharacters, settings.allowInvalidCharacters);
                    if (!fixedCategoryName) {
                        _this.errorMessages.push(_this.textErrorInvalidCategoryName);
                        reject();
                        return false;
                    }
                    _this.newCategoryName = fixedCategoryName;
                    for (var i = 0; i < _this.categories.length; i++) {
                        if (_this.newCategoryName === _this.categories[i]['name']) {
                            _this.errorMessages.push(_this.getErrorTextCategoryExist(_this.newCategoryName));
                            reject();
                            return false;
                        }
                    }
                    resolve();
                    return true;
                }
                // check report name
                var selectedCategoryName = _this.selectedCategory.name;
                // resolve if it is same report
                var reportInfo = _this.$izendaUrlService.getReportInfo();
                if (reportInfo.name === _this.reportName && reportInfo.category === selectedCategoryName) {
                    _this.errorMessages.push(_this.getErrorTextReportExist(selectedCategoryName +
                        _this.$izendaSettingsService.getCategoryCharacter() +
                        _this.reportName));
                    reject();
                    return false;
                }
                // check report isn't in that category
                if (selectedCategoryName === _this.textUncategorized) {
                    if (_this.isReportInReportList(_this.reportName, _this.reportSets)) {
                        _this.errorMessages.push(_this.getErrorTextReportExist(selectedCategoryName +
                            _this.$izendaSettingsService.getCategoryCharacter() +
                            _this.reportName));
                        reject();
                        return false;
                    }
                    resolve();
                    return true;
                }
                else {
                    _this.$izendaCommonQueryService.getReportSetCategory(selectedCategoryName).then(function (data) {
                        _this.reportSets = data.ReportSets;
                        if (_this.isReportInReportList(_this.reportName, data.ReportSets)) {
                            _this.errorMessages.push(_this.getErrorTextReportExist(selectedCategoryName +
                                _this.$izendaSettingsService.getCategoryCharacter() +
                                _this.reportName));
                            reject();
                            return false;
                        }
                        resolve();
                        return true;
                    });
                }
                return true;
            });
        };
        /**
         * Get category object by it's id
         */
        IzendaSelectReportNameComponent.prototype.getCategoryObjectById = function (id) {
            return this.categories.find(function (category) { return category.id === id; }) || null;
        };
        /**
         * Get category object by it's name
         */
        IzendaSelectReportNameComponent.prototype.getCategoryObjectByName = function (name) {
            return this.categories.find(function (category) { return category.name === name; }) || null;
        };
        IzendaSelectReportNameComponent.prototype.getInvalidCharsRegex = function () {
            var additionalCharacter = '';
            if (jsResources.categoryCharacter !== '\\')
                additionalCharacter = jsResources.categoryCharacter.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
            return new RegExp('[^A-Za-z0-9_/' + additionalCharacter + "\\-'' \\\\]", 'g');
        };
        IzendaSelectReportNameComponent.prototype.getErrorTextCategoryExist = function (categoryName) {
            return this.$izendaLocaleService.localeTextWithParams('js_CategoryExist', 'Category with name "{0}" already exist.', [categoryName]);
        };
        IzendaSelectReportNameComponent.prototype.getErrorTextReportExist = function (fullReportName) {
            return this.$izendaLocaleService.localeTextWithParams('js_ReportAlreadyExist', 'Dashboard or report "{0}" already exist', [fullReportName]);
        };
        IzendaSelectReportNameComponent = __decorate([
            izenda_component_6.default(module_definition_20.default, 'izendaSelectReportNameComponent', ['$q', '$izendaLocaleService', '$izendaUrlService', '$izendaSettingsService', '$izendaCommonQueryService', 'izenda.common.ui.reportNameInputPlaceholderText',
                'izenda.common.ui.reportNameEmptyError', 'izenda.common.ui.reportNameInvalidError'], {
                templateUrl: '###RS###extres=components.common.ui.components.select-report-name.select-report-name-template.html',
                bindings: {
                    opened: '<',
                    onSelected: '&',
                    onModalClosed: '&'
                }
            }),
            __metadata("design:paramtypes", [Function, localization_service_5.default,
                url_service_3.default,
                settings_service_4.default,
                common_query_service_3.default, Array, String, String])
        ], IzendaSelectReportNameComponent);
        return IzendaSelectReportNameComponent;
    }());
    exports.default = IzendaSelectReportNameComponent;
    /**
     * Directive docs.
     */
    var IzendaCategorySelect = /** @class */ (function () {
        function IzendaCategorySelect($izendaSettingsService) {
            this.$izendaSettingsService = $izendaSettingsService;
            this.restrict = 'A';
            this.scope = {
                categories: '=',
                category: '=',
                onSelect: '&',
                onCategoriesChanged: '&'
            };
            IzendaCategorySelect.prototype.link = function ($scope, $element) {
                var categoryCharacter = $izendaSettingsService.getCategoryCharacter();
                var commonSettings = $izendaSettingsService.getCommonSettings();
                var stripInvalidCharacters = commonSettings.stripInvalidCharacters;
                var allowInvalidCharacters = commonSettings.allowInvalidCharacters;
                var categoryControl = new AdHoc.Utility.IzendaCategorySelectorControl($element, categoryCharacter, stripInvalidCharacters, allowInvalidCharacters);
                categoryControl.addSelectedHandler(function (val) {
                    if (angular.isFunction($scope.onSelect)) {
                        $scope.onSelect({
                            val: val
                        });
                        $scope.$applyAsync();
                    }
                });
                // watch for collapsed state change
                $scope.$watchCollection('categories', function () {
                    updateCategories();
                    updateCategory();
                });
                $scope.$watch('category', function () {
                    updateCategory();
                });
                function updateCategories() {
                    var previousLength = $scope.categories.length;
                    categoryControl.setCategories($scope.categories);
                    var newCategories = collectCategories();
                    if (previousLength !== newCategories.length && angular.isFunction($scope.onCategoriesChanged)) {
                        $scope.onCategoriesChanged({
                            newCategories: newCategories
                        });
                        $scope.$applyAsync();
                    }
                }
                function updateCategory() {
                    if (angular.isObject($scope.category) && $scope.category.id !== 1) {
                        categoryControl.select($scope.category.name);
                    }
                }
                function collectCategories() {
                    var options = angular.element.map($element.children('option'), function ($option) {
                        return $option.value;
                    });
                    return options;
                }
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaCategorySelect.factory = function () {
            var directive = function ($izendaSettingsService) { return new IzendaCategorySelect($izendaSettingsService); };
            directive.$inject = ['$izendaSettingsService'];
            return directive;
        };
        return IzendaCategorySelect;
    }());
    module_definition_20.default.directive('izendaCategorySelect', ['$izendaSettingsService', IzendaCategorySelect.factory()]);
    var CategoryObject = /** @class */ (function () {
        function CategoryObject() {
        }
        return CategoryObject;
    }());
});
izendaRequire.define("common/ui/components/share/share-component", ["require", "exports", "common/ui/module-definition", "common/core/tools/izenda-component", "common/core/services/localization-service", "common/ui/services/share-service", "izenda-external-libs"], function (require, exports, module_definition_21, izenda_component_7, localization_service_6, share_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaShareComponent = /** @class */ (function () {
        function IzendaShareComponent($izendaLocaleService, $izendaShareService) {
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaShareService = $izendaShareService;
        }
        /**
         * Check is share rule selected right is valid
         */
        IzendaShareComponent.prototype.getShareRuleValidationMessage = function (shareRule) {
            if (!shareRule.right && !shareRule.subject)
                return this.$izendaLocaleService.localeText('js_NessesarySelectRight', 'It is necessary to choose the right, otherwise it will be ignored.');
            return null;
        };
        /**
         * Remove share rule handler.
         * @param {Core.IzendaShareRuleModel} shareRule
         */
        IzendaShareComponent.prototype.removeShareRule = function (shareRule) {
            this.$izendaShareService.removeShareRule(shareRule);
        };
        /**
         * Add share rule
         */
        IzendaShareComponent.prototype.addShareRule = function () {
            this.$izendaShareService.addNewShareRule();
        };
        IzendaShareComponent = __decorate([
            izenda_component_7.default(module_definition_21.default, 'izendaShareComponent', ['$izendaLocaleService', '$izendaShareService'], {
                templateUrl: '###RS###extres=components.common.ui.components.share.share-template.html',
                bindings: {
                    subjects: '<',
                    rights: '<',
                    shareRules: '<'
                }
            }),
            __metadata("design:paramtypes", [localization_service_6.default,
                share_service_1.default])
        ], IzendaShareComponent);
        return IzendaShareComponent;
    }());
    exports.default = IzendaShareComponent;
});
izendaRequire.define("common/ui/module", ["require", "exports", "common/ui/module-definition", "common/ui/services/share-service", "common/ui/services/schedule-service", "common/ui/directives/align-switcher", "common/ui/directives/autocomplete", "common/ui/directives/bootstrap", "common/ui/directives/color-picker", "common/ui/directives/datetime-picker", "common/ui/directives/report-viewer", "common/ui/directives/select-checkboxes", "common/ui/directives/splashscreen", "common/ui/directives/switcher", "common/ui/directives/toggle-button", "common/ui/components/schedule/schedule-component", "common/ui/components/select-report/select-report-component", "common/ui/components/select-report-name/select-report-name-component", "common/ui/components/share/share-component"], function (require, exports, module_definition_22, share_service_2, schedule_service_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    share_service_2.default.register(module_definition_22.default);
    schedule_service_2.default.register(module_definition_22.default);
});
izendaRequire.define("dashboard/module-definition", ["require", "exports", "angular", "common/common-module-definition", "common/ui/module-definition", "izenda-external-libs", "common/core/module", "common/query/module", "common/ui/module"], function (require, exports, angular, common_module_definition_1, module_definition_23) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * requirejs module, which creates angular modules.
     * returns 'loadSettings' function, which could load settings for this module.
     */
    // Create dashboards angular module
    var izendaDashboardModule = angular.module('izendaDashboard', [
        'ngCookies',
        'rx',
        'izenda.common.core',
        'izenda.common.query',
        'izenda.common.ui',
        'izendaFilters'
    ]);
    exports.default = izendaDashboardModule;
    // configure common ui module:
    module_definition_23.default
        .value('izenda.common.ui.reportNameInputPlaceholderText', ['js_DashboardName', 'Dashboard Name'])
        .value('izenda.common.ui.reportNameEmptyError', ['js_DashboardNameCantBeEmpty', 'Dashboard name can\'t be empty.'])
        .value('izenda.common.ui.reportNameInvalidError', ['js_InvalidDashboardName', 'Invalid dashboard Name']);
    var IzendaDashboardsLoader = /** @class */ (function () {
        function IzendaDashboardsLoader() {
        }
        /**
         * Create and configure modules
         */
        IzendaDashboardsLoader.configureModules = function (configObject) {
            var dashboardSettings = configObject;
            var dashboardConfig = {
                showDashboardToolbar: true,
                defaultDashboardCategory: null,
                defaultDashboardName: null,
                dashboardToolBarItemsSort: function (item1, item2) { return item1.localeCompare(item2); }
            };
            // configure instant report module
            var module = angular
                .module('izendaDashboard')
                .constant('izendaDashboardConfig', dashboardConfig)
                .config(['$logProvider', function ($logProvider) { $logProvider.debugEnabled(false); }])
                .config([
                '$provide', function ($provide) {
                    $provide.decorator('$browser', [
                        '$delegate', function ($delegate) {
                            $delegate.onUrlChange = function () { };
                            $delegate.url = function () { return ''; };
                            return $delegate;
                        }
                    ]);
                }
            ])
                .constant('$izendaDashboardSettings', dashboardSettings);
            return module;
        };
        /**
         * Bootstrap angular app:
         * window.urlSettings$ objects should be defined before this moment.
         */
        IzendaDashboardsLoader.bootstrap = function () {
            angular.element(document).ready(function () {
                // common settings promise:
                var commonQuerySettingsPromise = common_module_definition_1.IzendaCommonLoader.loadSettings();
                // instant report settings promise:
                var urlSettings = window.urlSettings$;
                var rsPageUrl = urlSettings.urlRsPage;
                var settingsUrl = rsPageUrl + '?wscmd=getDashboardSettings';
                var dashboardsSettingsPromise = angular.element.get(settingsUrl);
                // wait while all settings are loaded:
                angular.element
                    .when(commonQuerySettingsPromise, dashboardsSettingsPromise)
                    .then(function (commonSettingsResult, dashboardsSettingsResult) {
                    // get instant report config object
                    var configObject = dashboardsSettingsResult[0];
                    // create and configure modules:
                    IzendaDashboardsLoader.configureModules(configObject);
                    // bootstrap application:
                    angular.bootstrap('#izendaDashboardMainContainer', ['izendaDashboard']);
                });
            });
        };
        ;
        return IzendaDashboardsLoader;
    }());
    exports.IzendaDashboardsLoader = IzendaDashboardsLoader;
});
izendaRequire.define("dashboard/services/background-service", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Dashboard storage service. Stores current dashboard state.
     */
    var DashboardBackgroundService = /** @class */ (function () {
        function DashboardBackgroundService($cookies) {
            this.$cookies = $cookies;
            this.hueRotate = false;
        }
        Object.defineProperty(DashboardBackgroundService, "injectModules", {
            get: function () {
                return ['$cookies', '$rootScope'];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardBackgroundService.prototype, "finalBackgroundImageUrl", {
            get: function () {
                return this.backgroundImageType === 'file'
                    ? this.backgroundImageBase64
                    : this.backgroundImageUrl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardBackgroundService.prototype, "backgroundHueRotate", {
            // hueRotate get/set
            get: function () {
                return this.hueRotate;
            },
            set: function (val) {
                this.hueRotate = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardBackgroundService.prototype, "backgroundColor", {
            // color get/set
            get: function () {
                var backColor = this.getCookie('izendaDashboardBackgroundColor');
                return backColor || '#1c8fd6';
            },
            set: function (val) {
                this.setCookie('izendaDashboardBackgroundColor', val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardBackgroundService.prototype, "backgroundImageRepeat", {
            // image repeat get/set
            get: function () {
                return this.getCookie('izendaDashboardBackgroundImageRepeat') === 'true';
            },
            set: function (val) {
                this.setCookie('izendaDashboardBackgroundImageRepeat', val ? 'true' : 'false');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardBackgroundService.prototype, "backgroundImageType", {
            // backgroundImageType get/set
            get: function () {
                return this.getCookie('izendaDashboardBackgroundImageType');
            },
            set: function (val) {
                this.setCookie('izendaDashboardBackgroundImageType', val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardBackgroundService.prototype, "backgroundImageBase64", {
            // backgroundImageBase64 get/set
            get: function () {
                var result = '';
                if (this.isStorageAvailable()) {
                    var dataImage = localStorage.getItem('izendaDashboardBackgroundImageBase64');
                    if (angular.isString(dataImage))
                        result = dataImage;
                }
                else {
                    this.getCookie('izendaDashboardBackgroundImageBase64');
                }
                return result;
            },
            set: function (val) {
                if (this.isStorageAvailable()) {
                    if (val != null)
                        localStorage.setItem('izendaDashboardBackgroundImageBase64', val);
                    else
                        localStorage.removeItem('izendaDashboardBackgroundImageBase64');
                }
                else {
                    this.setCookie('izendaDashboardBackgroundImageBase64', val);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DashboardBackgroundService.prototype, "backgroundImageUrl", {
            // image url get/set
            get: function () {
                return this.getCookie('izendaDashboardBackgroundImageUrl');
            },
            set: function (val) {
                this.setCookie('izendaDashboardBackgroundImageUrl', val);
            },
            enumerable: true,
            configurable: true
        });
        // utility functions
        DashboardBackgroundService.prototype.getCookie = function (name) {
            return this.$cookies.get(name);
        };
        DashboardBackgroundService.prototype.setCookie = function (name, value) {
            this.$cookies.put(name, value);
        };
        DashboardBackgroundService.prototype.isStorageAvailable = function () {
            return typeof (Storage) !== 'undefined';
        };
        Object.defineProperty(DashboardBackgroundService, "$inject", {
            /**
             * Angular dependencies
             */
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        DashboardBackgroundService.register = function (module) {
            module.service('$izendaBackgroundService', DashboardBackgroundService.injectModules.concat(DashboardBackgroundService));
        };
        return DashboardBackgroundService;
    }());
    exports.default = DashboardBackgroundService;
});
izendaRequire.define("dashboard/model/tile-model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Izenda dashboard tile model class
     */
    var IzendaDashboardTileModel = /** @class */ (function () {
        function IzendaDashboardTileModel(isNew, json) {
            this.isNew = false;
            this.isSourceReportDeleted = false;
            this.title = '';
            this.description = '';
            this.x = 0;
            this.y = 0;
            this.width = 6;
            this.height = 3;
            this.canBeLoaded = true;
            this.designerType = 'ReportDesigner';
            this.maxRights = 'Full Access';
            this.top = 100;
            this.topString = '100';
            this.reportName = null;
            this.reportCategory = null;
            this.reportFullName = null;
            this.reportPartName = null;
            this.reportNameWithCategory = null;
            this.reportSetName = null;
            this.reportType = null;
            this.previousReportFullName = null;
            this.backTilePopupOpened = false;
            this.flip = null;
            this.id = IzendaDashboardTileModel.$$TileIdCounter++;
            this.isNew = isNew;
            this.fromJson(json);
        }
        /**
         * Factory method
         * @param {boolean} isNew is this tile marked as new.
         * @param {Object} rawModel tile properties.
         * @returns {IzendaDashboardTileModel} model instance.
         */
        IzendaDashboardTileModel.createInstance = function (isNew, json) {
            if (json === void 0) { json = null; }
            return new IzendaDashboardTileModel(isNew, json);
        };
        /**
         * Fill this object from the raw representation
         * @param {any} json Raw model.
         */
        IzendaDashboardTileModel.prototype.fromJson = function (json) {
            if (!json)
                return;
            this.isSourceReportDeleted = json.isSourceReportDeleted || false;
            this.title = json.reportTitle || '';
            this.description = json.reportDescription || '';
            this.x = json.x || 0;
            this.y = json.y || 0;
            this.width = json.width || 6;
            this.height = json.height || 3;
            this.canBeLoaded = json.canBeLoaded || true;
            this.designerType = json.designerType || 'ReportDesigner';
            this.maxRights = json.maxRights || 'Full Access';
            this.top = json.recordsCount || 100;
            this.topString = this.top + '';
            this.reportName = json.reportName || null;
            this.reportCategory = json.reportCategory || null;
            this.reportFullName = json.reportFullName || null;
            this.reportPartName = json.reportPartName || null;
            this.reportNameWithCategory = this.reportSetName = json.reportSetName || null;
            this.reportType = json.reportType || null;
        };
        /**
         * Create JSON config for sending it to server
         */
        IzendaDashboardTileModel.prototype.toJson = function () {
            var json = {
                isSourceReportDeleted: this.isSourceReportDeleted,
                reportTitle: this.title,
                reportDescription: this.description,
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                canBeLoaded: this.canBeLoaded,
                designerType: this.designerType,
                maxRights: this.maxRights,
                recordsCount: this.top,
                reportName: this.reportName || '',
                reportCategory: this.reportCategory || '',
                reportFullName: this.reportFullName || '',
                reportPartName: this.reportPartName || '',
                reportSetName: this.reportSetName || '',
                reportType: this.reportType
            };
            return json;
        };
        /**
         * Get tile geometric position
         * @param {Array<IzendaDashboardTileModel>} tiles Collection where this tile placed
         */
        IzendaDashboardTileModel.prototype.getTileOrder = function (tiles) {
            var tilesCopy = tiles.slice();
            tilesCopy.sort(function (tile1, tile2) {
                if (tile1.y !== tile2.y)
                    return tile1.y - tile2.y;
                return tile1.x - tile2.x;
            });
            return tilesCopy.indexOf(this);
        };
        IzendaDashboardTileModel.$$TileIdCounter = 1;
        return IzendaDashboardTileModel;
    }());
    exports.IzendaDashboardTileModel = IzendaDashboardTileModel;
});
izendaRequire.define("dashboard/model/dashboard-model", ["require", "exports", "dashboard/model/tile-model"], function (require, exports, tile_model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Izenda dashboard model class
     */
    var IzendaDashboardModel = /** @class */ (function () {
        function IzendaDashboardModel(isNew, json, share, schedule) {
            this.isNew = true;
            this.reportName = null;
            this.reportCategory = null;
            this.reportFullName = null;
            this.sourceReportFullName = null;
            this.effectiveRights = null;
            this.usesHiddenColumns = false;
            this.reportsWithHiddenColumns = [];
            this.tiles = [];
            if (!isNew && !json)
                throw new Error('Can\'t initialize dashboard model when isNew=false and rawModel is empty.');
            this.isNew = isNew;
            if (isNew) {
                this.reportName = null;
                this.reportCategory = null;
                this.reportFullName = null;
                this.sourceReportFullName = null;
                this.tiles = [
                    tile_model_1.IzendaDashboardTileModel.createInstance(true)
                ];
            }
            else {
                this.fromJson(json, share, schedule);
            }
        }
        /**
         * Factory method
         * @param {boolean} isNew new dashboard with defualt config or not.
         * @param {any} json dashboard server-side properties.
         * @returns {IzendaDashboardModel} model instance.
         */
        IzendaDashboardModel.createInstance = function (isNew, json) {
            return new IzendaDashboardModel(isNew, json);
        };
        /**
         * Json validation.
         */
        IzendaDashboardModel.isValidJson = function (json) {
            return json && typeof (json) === 'object' && json.hasOwnProperty('tiles');
        };
        Object.defineProperty(IzendaDashboardModel.prototype, "tilesSorted", {
            /**
             * Get sorted tiles by its positions.
             * @returns {IzendaDashboardTileModel[]} sorted tiles array (another instance of array!)
             */
            get: function () {
                return this.tiles.sort(function (tile1, tile2) {
                    if (tile1.y !== tile2.y)
                        return tile1.y - tile2.y;
                    return tile1.x - tile2.x;
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardModel.prototype, "tilesWithHiddenColumns", {
            get: function () {
                var _this = this;
                return this.tiles.filter(function (t) {
                    return _this.reportsWithHiddenColumns.indexOf(t.reportFullName) >= 0;
                });
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Fill this object from the raw representation
         * @param {any} json Raw model.
         */
        IzendaDashboardModel.prototype.fromJson = function (json, share, schedule) {
            this.reportName = json.reportName;
            this.reportCategory = json.reportCategory;
            this.reportFullName = json.reportFullName;
            this.sourceReportFullName = json.sourceReportFullName;
            this.effectiveRights = json.effectiveRights;
            this.usesHiddenColumns = json.usesHiddenColumns;
            this.reportsWithHiddenColumns = json.reportsWithHiddenColumns;
            this.filters = json.filters;
            this.tiles = json.tiles.map(function (tileCfg) { return tile_model_1.IzendaDashboardTileModel.createInstance(false, tileCfg); });
        };
        /**
         * Create JSON config for sending it to server
         */
        IzendaDashboardModel.prototype.toJson = function () {
            // filter out invalid tiles and sort by it's geometrical position
            var tilesCopy = this.tiles
                .filter(function (tile) { return !!tile.reportFullName; })
                .slice();
            tilesCopy.sort(function (tile1, tile2) {
                if (tile1.y !== tile2.y)
                    return tile1.y - tile2.y;
                return tile1.x - tile2.x;
            });
            var result = {
                isDashboard: true,
                isNew: this.isNew,
                reportName: this.reportName,
                reportCategory: this.reportCategory,
                reportFullName: this.reportFullName,
                sourceReportFullName: this.sourceReportFullName,
                filters: this.filters,
                tiles: tilesCopy.map(function (tile) { return tile.toJson(); })
            };
            return result;
        };
        /**
         * Add new tile with left, top coordinates {x, y}.
         * Maximum size of the created tile is 6x3.
         * @param {number} x left coordinate.
         * @param {number} y top coordinate.
         */
        IzendaDashboardModel.prototype.addPixelTile = function (x, y) {
            var newTile = tile_model_1.IzendaDashboardTileModel.createInstance(true);
            newTile.x = x;
            newTile.y = y;
            newTile.width = 1;
            newTile.height = 1;
            while (!this.checkTileIntersectsBbox(newTile) && newTile.width < 6 && newTile.width + newTile.x < 12)
                newTile.width++;
            if (this.checkTileIntersectsBbox(newTile))
                newTile.width--;
            while (!this.checkTileIntersectsBbox(newTile) && newTile.height < 3)
                newTile.height++;
            if (this.checkTileIntersectsBbox(newTile))
                newTile.height--;
            if (newTile.width <= 0 || newTile.height <= 0)
                return;
            this.tiles.push(newTile);
        };
        /**
         * Remove tile from dashboard
         * @param {IzendaDashboardTileModel} tile tile for removal.
         */
        IzendaDashboardModel.prototype.removeTile = function (tile) {
            this.tiles.splice(this.tiles.indexOf(tile), 1);
        };
        /**
         * If tile intersects with at least one of it's neighbors - return true.
         * @param {IzendaDashboardTileModel} tile tile which we check
         */
        IzendaDashboardModel.prototype.checkTileIntersectsBbox = function (tile) {
            var hitTest = function (a, b) {
                var aLeft = a.x;
                var aRight = a.x + a.width - 1;
                var aTop = a.y;
                var aBottom = a.y + a.height - 1;
                var bLeft = b.x;
                var bRight = b.x + b.width - 1;
                var bTop = b.y;
                var bBottom = b.y + b.height - 1;
                return !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
            };
            var otherTiles = this.tiles.filter(function (t) { return t.id !== tile.id; });
            return otherTiles.some(function (t) { return hitTest(tile, t); });
        };
        /**
         * Get maximum tile height.
         * @param {boolean} isOneColumnView desktop/mobile version.
         * @returns {number} maximum height in coordinate points.
         */
        IzendaDashboardModel.prototype.getMaxHeight = function (isOneColumnView) {
            if (isOneColumnView)
                return this.tiles.length * 4;
            var maxHeight = 0;
            this.tiles.forEach(function (tile) {
                if (maxHeight < tile.y + tile.height)
                    maxHeight = tile.y + tile.height;
            });
            return maxHeight;
        };
        return IzendaDashboardModel;
    }());
    exports.IzendaDashboardModel = IzendaDashboardModel;
});
izendaRequire.define("dashboard/services/dashboard-query-service", ["require", "exports", "angular", "dashboard/model/dashboard-model", "izenda-external-libs"], function (require, exports, angular, dashboard_model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
         * Dashboard query service. This service is not implied for direct use in components.
         */
    var DashboardQueryService = /** @class */ (function () {
        function DashboardQueryService($q, $izendaUtilUiService, $izendaRsQueryService, $izendaLocaleService, $izendaScheduleService, $izendaShareService) {
            this.$q = $q;
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.$izendaRsQueryService = $izendaRsQueryService;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaScheduleService = $izendaScheduleService;
            this.$izendaShareService = $izendaShareService;
        }
        Object.defineProperty(DashboardQueryService, "injectModules", {
            get: function () {
                return ['$q', '$izendaUtilUiService', '$izendaRsQueryService', '$izendaLocaleService', '$izendaScheduleService',
                    '$izendaShareService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * (new!) Load dashboard config json
         * @param {string} dashboardFullName dashboard report set full name
         * @param {boolean} updateFromSource whether need to update dashboard tiles from source report or not.
         */
        DashboardQueryService.prototype.loadDashboardNew = function (dashboardFullName, updateFromSource) {
            var _this = this;
            if (!dashboardFullName)
                throw 'dashboardFullName should be non-empty string.';
            return this.$q(function (resolve, reject) {
                _this.$izendaRsQueryService.apiQuery('loadDashboardConfigNew', [dashboardFullName, updateFromSource]).then(function (json) {
                    // validate query result
                    if (!dashboard_model_1.IzendaDashboardModel.isValidJson(json)) {
                        reject("Query \"loadDashboardConfigNew\" returned invalid result:" + JSON.stringify(json));
                        return;
                    }
                    // extract share & schedule configs from json and create its models in the share and schedule services.
                    _this.$izendaScheduleService.setScheduleConfig(json.schedule);
                    _this.$izendaShareService.setShareConfig(json.share);
                    var dashboardModel = dashboard_model_1.IzendaDashboardModel.createInstance(false, json);
                    resolve(dashboardModel);
                }, function (error) {
                    reject(error);
                });
            });
        };
        /**
         * (new!) Save dashboard.
         * @param {any} json dashboard model.
         */
        DashboardQueryService.prototype.saveDashboardNew = function (json) {
            if (!json)
                throw new Error('Dashboard json is empty');
            var dashboardConfigParam = JSON.stringify(json);
            return this.$izendaRsQueryService.apiQuery('saveReportSetNew', [dashboardConfigParam]);
        };
        /**
         * Deserealize dashboard into CurrentReportSet.
         * @param {any} json dashboard json
         * @param {IzendaDashboardTileModel} tile
         */
        DashboardQueryService.prototype.syncTilesNew = function (json, tile) {
            var dashboardConfigParam = JSON.stringify(json);
            return this.$izendaRsQueryService.apiQuery('syncDashboardNew', [dashboardConfigParam, tile && tile.reportFullName ? tile.reportFullName : '']);
        };
        /**
         * Deserealize dashboard and return it's filters
         * @param {json} dashboardConfig
         */
        DashboardQueryService.prototype.syncFiltersNew = function (dashboardConfig) {
            var dashboardConfigParam = JSON.stringify(dashboardConfig);
            return this.$izendaRsQueryService.apiQuery('syncDashboardFiltersNew', [dashboardConfigParam]);
        };
        /**
         * Load tile HTML
         * @param {any} dashboardConfig
         * @param {IzendaDashboardTileModel} tiles which preview is required
         */
        DashboardQueryService.prototype.loadTilesPreviewNew = function (dashboardConfig, tile, size) {
            if (!angular.isObject(tile))
                throw 'Argument exception: "tile" parameter should be object.';
            var dashboardConfigParam = JSON.stringify(dashboardConfig);
            return this.$izendaRsQueryService.apiQuery('getDashboardTilePreviewNew', [dashboardConfigParam, tile.reportFullName, size.width, size.height]);
        };
        /**
         * Send report via email
         */
        DashboardQueryService.prototype.sendReportViaEmailNew = function (dashboardConfig, type, to) {
            var dashboardConfigParam = JSON.stringify(dashboardConfig);
            return this.$izendaRsQueryService.apiQuery('sendDashboardEmailNew', [dashboardConfigParam, type, to]);
        };
        /**
         * Load refresh intevals configured in AdHocSettings.
         */
        DashboardQueryService.prototype.loadAutoRefreshIntervalsNew = function () {
            var _this = this;
            return this.$q(function (resolve) {
                _this.$izendaRsQueryService.apiQuery('autorefreshintervals', []).then(function (result) {
                    resolve(result);
                }, function (error) {
                    var errorMessage = _this.$izendaLocaleService.localeText('js_DashboardAutoRefreshError', 'Failed to get auto refresh intervals');
                    _this.$izendaUtilUiService.showErrorDialog(errorMessage + ": " + error);
                });
            });
        };
        /**
         * Load dashboard navigation
         */
        DashboardQueryService.prototype.loadDashboardNavigationNew = function () {
            return this.$izendaRsQueryService.apiQuery('getDashboardCategoriesNew', []);
        };
        Object.defineProperty(DashboardQueryService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        DashboardQueryService.register = function (module) {
            module.service('$izendaDashboardQueryService', DashboardQueryService.injectModules.concat(DashboardQueryService));
        };
        return DashboardQueryService;
    }());
    exports.default = DashboardQueryService;
});
izendaRequire.define("dashboard/model/gallery-state-model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaDashboardGalleryStateModel = /** @class */ (function () {
        function IzendaDashboardGalleryStateModel() {
            this.isEnabledInner = false;
            this.isFullScreen = false;
            this.playDelay = 5000;
            this.isPlayStarted = false;
            this.isPlayRepeat = false;
            this.reset();
        }
        IzendaDashboardGalleryStateModel.prototype.reset = function () {
            this.isEnabledInner = false;
            this.isFullScreen = false;
            this.playDelay = 5000;
            this.isPlayStarted = false;
            this.isPlayRepeat = false;
        };
        Object.defineProperty(IzendaDashboardGalleryStateModel.prototype, "isEnabled", {
            get: function () {
                return this.isEnabledInner;
            },
            set: function (value) {
                this.isEnabledInner = value;
                this.isFullScreen = false; // turn off fullscreen
                this.isPlayStarted = false; // turn off play
            },
            enumerable: true,
            configurable: true
        });
        return IzendaDashboardGalleryStateModel;
    }());
    exports.IzendaDashboardGalleryStateModel = IzendaDashboardGalleryStateModel;
});
izendaRequire.define("dashboard/services/gallery-service", ["require", "exports", "dashboard/model/gallery-state-model", "izenda-external-libs"], function (require, exports, gallery_state_model_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DashboardGalleryService = /** @class */ (function () {
        function DashboardGalleryService($izendaUrlService) {
            this.$izendaUrlService = $izendaUrlService;
            this.galleryState = new gallery_state_model_1.IzendaDashboardGalleryStateModel();
            // subscibe on location change.
            this.location = this.$izendaUrlService.location;
            this.location.subscribeOnNext(this.$onLocationChanged, this);
        }
        Object.defineProperty(DashboardGalleryService, "injectModules", {
            get: function () {
                return ['$izendaUrlService'];
            },
            enumerable: true,
            configurable: true
        });
        DashboardGalleryService.prototype.$onLocationChanged = function (newLocation) {
            this.galleryState.reset();
        };
        Object.defineProperty(DashboardGalleryService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        DashboardGalleryService.register = function (module) {
            module.service('$izendaGalleryService', DashboardGalleryService.injectModules.concat(DashboardGalleryService));
        };
        return DashboardGalleryService;
    }());
    exports.default = DashboardGalleryService;
});
izendaRequire.define("common/core/models/filters-model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Server-side filters object raw model.
     */
    var IzendaFiltersModel = /** @class */ (function () {
        function IzendaFiltersModel() {
            this.filterLogic = '';
            this.filters = [];
            this.subreportsFilters = null;
        }
        IzendaFiltersModel.prototype.fromJson = function (json) {
            this.filterLogic = json.FilterLogic || '';
            this.filters = json.Filters || [];
            this.subreportsFilters = json.SubreportsFilters || null;
        };
        IzendaFiltersModel.prototype.toJson = function () {
            return {
                FilterLogic: this.filterLogic,
                Filters: this.filters,
                SubreportFilters: this.subreportsFilters
            };
        };
        return IzendaFiltersModel;
    }());
    exports.IzendaFiltersModel = IzendaFiltersModel;
});
izendaRequire.define("dashboard/services/dashboard-storage-service", ["require", "exports", "angular", "common/core/models/filters-model", "dashboard/model/dashboard-model", "izenda-external-libs"], function (require, exports, angular, filters_model_1, dashboard_model_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Dashboard storage service. Stores current dashboard state.
     */
    var DashboardStorageService = /** @class */ (function () {
        function DashboardStorageService($rx, $q, $window, $interval, $timeout, $izendaLocaleService, $izendaCompatibilityService, $izendaSettingsService, $izendaUtilService, $izendaUrlService, $izendaRsQueryService, $izendaUtilUiService, $izendaDashboardConfig, $izendaDashboardQueryService, $izendaScheduleService, $izendaShareService) {
            this.$rx = $rx;
            this.$q = $q;
            this.$window = $window;
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaUtilService = $izendaUtilService;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaRsQueryService = $izendaRsQueryService;
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.$izendaDashboardConfig = $izendaDashboardConfig;
            this.$izendaDashboardQueryService = $izendaDashboardQueryService;
            this.$izendaScheduleService = $izendaScheduleService;
            this.$izendaShareService = $izendaShareService;
            this.UNCATEGORIZED = this.$izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
            // rx subjects
            this.model = new this.$rx.BehaviorSubject(null);
            this.categories = new this.$rx.BehaviorSubject([]);
            this.currentCategory = new this.$rx.BehaviorSubject([]);
            this.currentDashboard = new this.$rx.BehaviorSubject(null);
            this.isLoaded = new this.$rx.BehaviorSubject(false);
            this.isFiltersActive = new this.$rx.BehaviorSubject(false);
            this.exportProgress = new this.$rx.BehaviorSubject(null);
            this.autoRefresh = new this.$rx.BehaviorSubject({
                intervals: []
            });
            this.refreshObservable = new this.$rx.Subject();
            this.windowSize = new this.$rx.BehaviorSubject({
                width: this.$window.innerWidth,
                height: this.$window.innerHeight
            });
            this.windowSizeActive = true;
            // set custom refresh cascading filters function
            this._setFiltersRefreshCascadingInterceptor();
            // subscribe on location change.
            this.location = $izendaUrlService.location;
            this.location.subscribeOnNext(this._$onLocationChanged, this);
            // subscribe on window resize
            this.turnOnResizeHandler();
            // load some static stuff.
            this.loadAutoRefreshIntervals();
        }
        Object.defineProperty(DashboardStorageService, "injectModules", {
            get: function () {
                return [
                    'rx', '$q', '$window', '$interval', '$timeout', '$izendaLocaleService', '$izendaCompatibilityService',
                    '$izendaSettingsService', '$izendaUtilService', '$izendaUrlService', '$izendaRsQueryService',
                    '$izendaUtilUiService', 'izendaDashboardConfig', '$izendaDashboardQueryService',
                    '$izendaScheduleService', '$izendaShareService'
                ];
            },
            enumerable: true,
            configurable: true
        });
        DashboardStorageService.prototype.turnOnResizeHandler = function () {
            var _this = this;
            var resize = new this.$rx.Observable.fromEvent(this.$window, 'resize');
            var resizeDebounce = resize.debounce(500);
            var resizeCombined = this.$rx.Observable.merge(resize.map(function (e) { return ({ event: e, isDebounceApplied: false }); }), resizeDebounce.map(function (e) { return ({ event: e, isDebounceApplied: true }); }));
            // combined resize events emitter (simple resize event will come earlier than it's debounced version)
            resizeCombined.subscribe(function (obj) {
                // if resize is turned off - do nothing
                if (!_this.windowSizeActive)
                    return;
                var isDebounceApplied = obj.isDebounceApplied;
                if (!isDebounceApplied) {
                    //var overflowValue = angular.element('body').css('overflow');
                    //if (overflowValue !== 'hidden') {
                    //	angular.element('body').css('overflow', 'hidden');
                    //}
                }
                else {
                    // notify
                    _this.windowSize.onNext({
                        width: _this.$window.innerWidth,
                        height: _this.$window.innerHeight
                    });
                }
            });
        };
        /**
         * Change location to new dashboard
         */
        DashboardStorageService.prototype.navigateNewDashboard = function () {
            this.$izendaUrlService.setIsNew();
        };
        /**
         * Change location to existing dashboard
         * @param {string} dashboardFullName dashboard report set full name.
         */
        DashboardStorageService.prototype.navigateToDashboard = function (dashboardFullName) {
            this.$izendaUrlService.setReportFullName(dashboardFullName);
        };
        /**
         * Save dashboard. If assigned new report name and category - navigation to the new dashboard will occur.
         * @param {string} reportName New report name (optional). If not set - report will be saved using current report name.
         * @param {string} categoryName New category name (optional). If not set (or reportName not set) - report
         * will be saved using current category name.
         * @throws {reject function} promise will reject with a message as argument if something went wrong.
         */
        DashboardStorageService.prototype.saveDashboard = function (reportName, categoryName) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                try {
                    // prepare report name variables
                    var newReportName = reportName || null;
                    var newReportCategory = categoryName || null;
                    var newReportFullName_1;
                    if (_this.$izendaUtilService.isUncategorized(newReportCategory))
                        newReportCategory = null;
                    if (newReportName) {
                        // if name was set
                        newReportFullName_1 = _this.$izendaUtilService.createReportFullName(newReportName, _this.$izendaSettingsService.getCategoryCharacter(), newReportCategory);
                    }
                    else {
                        // if name wasn't set
                        var currentLocation = _this.location.getValue();
                        newReportName = currentLocation.name;
                        newReportCategory = currentLocation.category;
                        newReportFullName_1 = currentLocation.fullName;
                    }
                    // update report names in the model
                    var model = _this.model.getValue();
                    model.reportCategory = newReportCategory;
                    model.reportName = newReportName;
                    model.reportFullName = _this.$izendaSettingsService.getReportFullName(newReportName, newReportCategory);
                    // create json and send save request
                    var json = _this.createJsonConfigForSend();
                    _this.$izendaDashboardQueryService.saveDashboardNew(json).then(function () {
                        _this.$izendaUrlService.setReportFullName(newReportFullName_1);
                        resolve();
                    }, function (error) {
                        reject(error);
                    });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * Load tiles HTML content.
         * @param {IzendaDashboardTileModel} tile Tile object.
         * @param {object} size {width, height} object.
         */
        DashboardStorageService.prototype.loadTilesPreview = function (tile, size) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                try {
                    var sizeObject = size || { width: 0, height: 0 };
                    var json = _this.createJsonConfigForSend();
                    _this.$izendaDashboardQueryService.loadTilesPreviewNew(json, tile, sizeObject)
                        .then(function (result) { return resolve(result); }, function (error) { return reject(error); });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * Load and prepare report into container
         * @param {string} report html data.
         * @param {jquery dom element} container.
         */
        DashboardStorageService.prototype.loadReportIntoContainer = function (htmlData, $container) {
            var customCssStart = '/*CustomCssStart*/';
            var customCssEnd = '/*CustomCssEnd*/';
            /**
             * Extract custom css rules
             */
            var extractCustomCss = function (html) {
                if (!angular.isFunction(CSSParser))
                    throw 'Css parser (cssParser.js) not found';
                var startIndex = html.indexOf(customCssStart);
                var endIndex = html.indexOf(customCssEnd);
                if (startIndex < 0 || endIndex < 0 || startIndex > endIndex)
                    return null;
                try {
                    var customCss = html.substring(startIndex + customCssStart.length, endIndex);
                    var parser = new CSSParser();
                    var sheet = parser.parse(customCss, false, true);
                    return sheet;
                }
                catch (e) {
                    return null;
                }
            };
            /**
             * Inject custom css
             */
            var injectCustomCss = function (html, customCss) {
                var startIndex = html.indexOf(customCssStart);
                var endIndex = html.indexOf(customCssEnd);
                if (startIndex < 0 || endIndex < 0 || startIndex > endIndex)
                    return null;
                var result = [
                    html.substring(0, startIndex),
                    customCssStart,
                    customCss,
                    customCssEnd,
                    html.substring(endIndex + customCssStart.length)
                ].join('');
                return result;
            };
            /**
             * Change rules
             */
            var replaceCssRules = function (sourceStyleSheet, selectorTextChangeFunction) {
                var cssRules = sourceStyleSheet.cssRules;
                cssRules.forEach(function (rule) {
                    if (rule.type === 1) {
                        var selector = rule.mSelectorText;
                        rule.mSelectorText = selectorTextChangeFunction(selector);
                    }
                    else if (rule.type === 4) {
                        replaceCssRules(rule, selectorTextChangeFunction);
                    }
                });
            };
            try {
                var tileId = $container.closest('.izenda-report-with-id').attr('reportid');
                // clear previous content
                $container.empty();
                // turn off internal visualization window resize handler.
                izenda.visualization.isResizeHandlerEnabled = false;
                // load response to container
                if (angular.isObject(htmlData) && htmlData.hasOwnProperty('message')) {
                    console.error(htmlData);
                    izenda.report.loadReportResponse(htmlData['message'], $container);
                }
                else
                    izenda.report.loadReportResponse(htmlData, $container);
                // replace CSS
                var $customCss = $container.find('style[id=additionalStyle]');
                if ($customCss.length > 0) {
                    var csshtml = $customCss.html();
                    var styleSheet = extractCustomCss(csshtml);
                    if (styleSheet) {
                        // replace rule selectors:
                        replaceCssRules(styleSheet, function (selector) {
                            var parts = selector.split(',');
                            var result = '';
                            parts.forEach(function (part, index) {
                                if (index > 0)
                                    result += ', ';
                                result += ".izenda-report-with-id[reportid=\"" + tileId + "\"] " + part.trim();
                            });
                            return result;
                        });
                    }
                    var newCss = styleSheet.cssText();
                    var newHtml = injectCustomCss(csshtml, newCss);
                    $customCss.html(newHtml);
                }
                $container.find('[id$=_outerSpan]').css('display', 'block');
                // prepare content div
                var divs$ = $container.find('div.DashPartBody, div.DashPartBodyNoScroll');
                if (divs$.length > 0) {
                    divs$.css('height', 'auto');
                    divs$.find('span').each(function (iSpan, span) {
                        var $span = angular.element(span);
                        if ($span.attr('id') && String($span.attr('id')).indexOf('_outerSpan') >= 0) {
                            $span.css('display', 'inline');
                        }
                    });
                    var $zerochartResults = divs$.find('.iz-zero-chart-results');
                    if ($zerochartResults.length > 0) {
                        $zerochartResults.closest('table').css('height', '100%');
                        divs$.css('height', '100%');
                    }
                }
                // init gauge
                if (angular.isDefined(AdHoc) &&
                    angular.isObject(AdHoc.Utility) &&
                    angular.isFunction(AdHoc.Utility.InitGaugeAnimations)) {
                    AdHoc.Utility.InitGaugeAnimations(null, null);
                }
            }
            catch (e) {
                $container.empty();
                var failedMsg = this.$izendaLocaleService.localeText('js_FailedToLoadReport', 'Failed to load report') + ': ' + e;
                $container.append("<b>" + failedMsg + "</b>");
                console.error(failedMsg);
            }
        };
        /**
         * Print dashboard
         * @param {string} type
         */
        DashboardStorageService.prototype.printDashboard = function (type, reportForPrint) {
            var _this = this;
            this.exportProgress.onNext('print');
            return this.$q(function (resolve, reject) {
                var resolveWrapper = function () {
                    _this.exportProgress.onNext(null);
                    resolve();
                };
                var rejectWrapper = function (error) {
                    _this.exportProgress.onNext(null);
                    reject(error);
                };
                if (type !== 'html' && type !== 'pdf' && type !== 'excel') {
                    rejectWrapper("Unknown print type: " + type);
                    return;
                }
                var json = _this.createJsonConfigForSend();
                _this.$izendaDashboardQueryService.syncTilesNew(json, reportForPrint).then(function () {
                    if (type === 'html')
                        _this.printDashboardAsHtml(reportForPrint).then(function () { return resolveWrapper(); }, function (error) { return rejectWrapper(error); });
                    else if (type === 'excel')
                        _this.printDashboardAsExcel(reportForPrint).then(function () { return resolveWrapper(); }, function (error) { return rejectWrapper(error); });
                    else if (type === 'pdf')
                        _this.printDashboardAsPDF(reportForPrint).then(function () { return resolveWrapper(); }, function (error) { return rejectWrapper(error); });
                }, function (error) { return rejectWrapper(error); });
            });
        };
        /**
         * Open new window with the new dashboard for printing.
         * @param {string} reportForPrint report part. Only one report will be printed if defined.
         */
        DashboardStorageService.prototype.printDashboardAsHtml = function (reportForPrint) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                try {
                    var printUrl = _this.$izendaUrlService.settings.urlRsPage + "?p=htmlreport&print=1";
                    // print single tile if parameter is set:
                    if (angular.isString(reportForPrint) && reportForPrint !== '')
                        printUrl += "&reportPartName=" + encodeURIComponent(reportForPrint);
                    // izpid and anpid will be added inside the ExtendReportExport method 
                    _this.$timeout(function () {
                        var newWindow = ExtendReportExport(responseServer.OpenUrl, printUrl, 'aspnetForm', '', '', true);
                        if ('WebkitAppearance' in document.documentElement.style) {
                            var intervalId_1 = _this.$interval(function () {
                                if (!newWindow || newWindow.closed) {
                                    _this.$interval.cancel(intervalId_1);
                                    intervalId_1 = null;
                                    resolve();
                                }
                            }, 500);
                        }
                        else {
                            resolve();
                        }
                    }, 500);
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            });
        };
        /**
         * Export dashboard to file
         * @param {string} outputType output type query parameter
         * @param {string} reportForPrint report part. Only one report will be printed if defined.
         */
        DashboardStorageService.prototype.printDashboardAsFile = function (outputType, reportForPrint) {
            var _this = this;
            if (!outputType)
                throw 'Parameter "outputType" should be defined';
            return this.$q(function (resolve, reject) {
                try {
                    var addParam = '';
                    if (typeof (window.izendaPageId$) !== 'undefined')
                        addParam += "&izpid=" + window.izendaPageId$;
                    if (typeof (window.angularPageId$) !== 'undefined')
                        addParam += "&anpid=" + window.angularPageId$;
                    var url = _this.$izendaUrlService.settings.urlRsPage + '?';
                    if (reportForPrint)
                        url += "rpn=" + reportForPrint + "&";
                    url += "output=" + outputType + addParam;
                    // download the file
                    _this.$izendaRsQueryService.downloadFileRequest('GET', url).then(function () { return resolve(); });
                }
                catch (e) {
                    console.error(e);
                    reject(e);
                }
            });
        };
        /**
         * Export dashboard tile as excel
         * @param {string} reportForPrint report part. Only one report will be printed if defined.
         */
        DashboardStorageService.prototype.printDashboardAsExcel = function (reportForPrint) {
            return this.printDashboardAsFile('XLS(MIME)', reportForPrint);
        };
        /**
         * Print dashboard into PDF
         * @param {string} reportForPrint report part. Only one report will be printed if defined.
         */
        DashboardStorageService.prototype.printDashboardAsPDF = function (reportForPrint) {
            return this.printDashboardAsFile('PDF', reportForPrint);
        };
        /**
         * Send email
         */
        DashboardStorageService.prototype.sendEmail = function (sendType, email) {
            var _this = this;
            return this.$q(function (resolve, reject) {
                try {
                    var json = _this.createJsonConfigForSend();
                    _this.$izendaDashboardQueryService.sendReportViaEmailNew(json, sendType, email)
                        .then(function (result) { return resolve(result); }, function (error) { return reject(error); });
                }
                catch (e) {
                    reject(e);
                }
            });
        };
        /**
         * Turn on/off filters panel.
         * @param {any} opened
         */
        DashboardStorageService.prototype.toggleFiltersPanel = function (opened) {
            var currentOpened = this.isFiltersActive.getValue();
            if (angular.isDefined(opened)) {
                if (currentOpened != opened)
                    this.isFiltersActive.onNext(opened);
            }
            else {
                this.isFiltersActive.onNext(!currentOpened);
            }
        };
        /**
         * Update dashboard filters
         */
        DashboardStorageService.prototype.refreshFilters = function () {
            var _this = this;
            var json = this.createJsonConfigForSend();
            this.$izendaDashboardQueryService.syncFiltersNew(json).then(function (filtersData) {
                _this._setFiltersData(filtersData);
            }, function (error) {
                console.error('Failed to get filters data: ', error);
            });
        };
        /**
         * Refresh dashboard
         * @param {boolean} reloadLayout reload dashboard layout from the server.
         * @param {boolean} updateFromSource update tiles from it's sources.
         * @param {IzendaDashboardTileModel} tile update only one tile.
         */
        DashboardStorageService.prototype.refreshDashboard = function (reloadLayout, updateFromSource, tile) {
            if (reloadLayout) {
                this._$onLocationChanged(this.location.getValue(), !!updateFromSource);
            }
            else {
                this.refreshObservable.onNext({
                    tile: tile || null,
                    updateFromSource: !!updateFromSource
                });
            }
        };
        /**
         * Cancels refresh dashboard queries
         */
        DashboardStorageService.prototype.cancelRefreshDashboardQueries = function () {
            this.$izendaRsQueryService.cancelAllQueries({
                cancelList: [
                    {
                        wscmd: 'getDashboardTilePreviewNew'
                    }
                ]
            });
        };
        /**
         * Load auto refresh intervals config. After complete this.autoRefresh is notified
         */
        DashboardStorageService.prototype.loadAutoRefreshIntervals = function () {
            var _this = this;
            var newAutoRefresh = {
                intervals: []
            };
            this.$izendaDashboardQueryService.loadAutoRefreshIntervalsNew().then(function (data) {
                for (var name_1 in data)
                    if (data.hasOwnProperty(name_1))
                        newAutoRefresh.intervals.push({ name: name_1, value: data[name_1], selected: false });
                _this.autoRefresh.onNext(newAutoRefresh, _this);
            });
        };
        /**
         * Turn on window resize handler event emitter
         */
        DashboardStorageService.prototype.turnOnWindowResizeHandler = function () {
            this.windowSizeActive = true;
        };
        /**
         * Turn off window resize handler event emitter
         */
        DashboardStorageService.prototype.turnOffWindowResizeHandler = function () {
            this.windowSizeActive = false;
        };
        /**
         * Create json config
         */
        DashboardStorageService.prototype.createJsonConfigForSend = function () {
            // create json for sending to server
            var model = this.model.getValue();
            var scheduleJson = this.$izendaScheduleService.getScheduleConfigForSend();
            var shareJson = this.$izendaShareService.getShareConfigForSend();
            // legacy API call.
            var filtersJson = [];
            if (angular.isFunction(GetDataToCommit))
                filtersJson = GetDataToCommit();
            var filtersRaw = new filters_model_1.IzendaFiltersModel();
            filtersRaw.fromJson({
                FilterLogic: '',
                Filters: filtersJson,
                SubreportsFilters: []
            });
            var json = model.toJson();
            json.share = shareJson;
            json.schedule = scheduleJson;
            json.filters = filtersRaw.toJson();
            return json;
        };
        /**
         * Calculate category name
         */
        DashboardStorageService.prototype._getWantedCategoryName = function () {
            var _this = this;
            var urlFullName = this.location.getValue().fullName;
            var categories = this.categories.getValue();
            var isUrlFullNameExist = function (testFullName) { return categories.some(function (cat) { return cat.dashboards.some(function (dashName) { return dashName === testFullName; }); }); };
            // calc current dashboard category
            var currentCategoryName = '';
            var isCategorySet = false;
            if (isUrlFullNameExist(urlFullName)) {
                currentCategoryName = this.location.getValue().category;
                isCategorySet = true;
            }
            if (!isCategorySet && this.$izendaDashboardConfig.defaultDashboardCategory !== null) {
                currentCategoryName = this.$izendaDashboardConfig.defaultDashboardCategory;
                isCategorySet = true;
            }
            if (!isCategorySet) {
                var uncategorized = categories.first(function (cat) { return _this.$izendaUtilService.isUncategorized(cat.name); });
                if (uncategorized)
                    currentCategoryName = uncategorized.name; // if we have "uncategorized" dashboards - select it
                else
                    currentCategoryName = categories.length ? categories[0].name : '';
            }
            return currentCategoryName;
        };
        /**
         * Check report name obtained from the 'rn' parameter and load default dashboard if rn parameter doesn't
         * contain valid dashboard name.
         * @param {object} location Location object.
         * @returns {string} fixed dashboard full name (or empty string if can't find default dashboard).
         */
        DashboardStorageService.prototype._getWantedReportFullName = function (location) {
            var urlFullName = location.fullName;
            var categories = this.categories.getValue();
            var isUrlFullNameExist = function (testFullName) { return categories.some(function (cat) { return cat.dashboards.some(function (dashName) { return dashName === testFullName; }); }); };
            // calc current dashboard category
            var currentCategoryName = this._getWantedCategoryName();
            // calc current dashboard full name
            var currentDashboardFullName = '';
            var isCurrentDashbiardNameSet = false;
            if (isUrlFullNameExist(urlFullName)) {
                currentDashboardFullName = urlFullName;
                isCurrentDashbiardNameSet = true;
            }
            if (!isCurrentDashbiardNameSet && this.$izendaDashboardConfig.defaultDashboardName !== null) {
                currentDashboardFullName = this.$izendaDashboardConfig.defaultDashboardName;
                if (currentDashboardFullName && currentCategoryName && !this.$izendaUtilService.isUncategorized(currentCategoryName)) {
                    currentDashboardFullName =
                        currentCategoryName + this.$izendaSettingsService.getCategoryCharacter() + currentDashboardFullName;
                }
                isCurrentDashbiardNameSet = true;
            }
            // couldn't find dashboard - use first
            if (!isCurrentDashbiardNameSet) {
                var defaultCats = categories.filter(function (cat) { return cat.dashboards.length; });
                currentDashboardFullName = defaultCats.length ? defaultCats[0].dashboards[0] : '';
            }
            return currentDashboardFullName;
        };
        /**
         * Update dashboards in current category collection and current active dashboard
         */
        DashboardStorageService.prototype._updateCurrentCategory = function () {
            var _this = this;
            var categories = this.categories.getValue();
            var currentCategoryName = this._getWantedCategoryName();
            var currentDashboardName = this._getWantedReportFullName(this.location.getValue());
            var category = categories.first(function (cat) { return currentCategoryName === cat.name ||
                (_this.$izendaUtilService.isUncategorized(currentCategoryName) && _this.$izendaUtilService.isUncategorized(cat.name)); });
            var currentDashboardsCollection = [];
            var currentDashboard = null;
            if (category) {
                category.dashboards.forEach(function (dash, iDash) {
                    var dashObj = {
                        id: iDash,
                        fullName: dash,
                        text: _this.$izendaUrlService.extractReportName(dash)
                    };
                    currentDashboardsCollection.push(dashObj);
                    if (_this.location.getValue().isNew)
                        return;
                    if (dash === currentDashboardName)
                        currentDashboard = dashObj;
                });
            }
            this.currentCategory.onNext(currentDashboardsCollection);
            this.currentDashboard.onNext(currentDashboard);
        };
        /**
         * Location changed handler:
         * 1. Load categories.
         * 2. Create/Open dashboard.
         * 3. Navigate to default dashboard if something went wrong (dashboard not exists, or url parameters not set).
         * @param {object} newLocation location info object
         * @param {boolean} updateFromSource is reload tiles from its sources required?
         */
        DashboardStorageService.prototype._$onLocationChanged = function (newLocation, updateFromSource) {
            var _this = this;
            this.$izendaRsQueryService.cancelAllQueries();
            this.model.onNext(null);
            this._loadCategories().then(function () {
                if (newLocation.isNew) {
                    _this._newDashboard();
                    return;
                }
                // validate report full name:
                var wantedFullName = _this._getWantedReportFullName(newLocation);
                if (!wantedFullName) {
                    _this.navigateNewDashboard(); // change url to "?isNew=1"
                    return;
                }
                if (newLocation.fullName === wantedFullName) {
                    // wanted report and report from the location are the same - open dashboard.
                    _this.loadDashboardInternal(wantedFullName, !!updateFromSource);
                }
                else {
                    if (newLocation.fullName) {
                        // show notification to a user if we change the location from wrong report to default.
                        var message = _this.$izendaLocaleService.localeText('js_FailedToLoadDashboard', 'Failed to load dashboard "{0}". Opening default dashboard "{1}".');
                        message = message.replace('{0}', newLocation.fullName);
                        message = message.replace('{1}', wantedFullName);
                        _this.$izendaUtilUiService.showNotification(message);
                    }
                    _this.navigateToDashboard(wantedFullName); // change url to "?rn=default_dashboard"
                }
            });
        };
        /**
         * Load dashboard categories
         */
        DashboardStorageService.prototype._loadCategories = function () {
            var _this = this;
            return this.$q(function (resolve, reject) {
                _this.$izendaDashboardQueryService.loadDashboardNavigationNew().then(function (data) {
                    if (!data) {
                        reject("Failed to load dashboard categories. Result: " + data);
                        return;
                    }
                    var idCounter = 0;
                    var newCategories = [];
                    for (var category in data) {
                        if (data.hasOwnProperty(category)) {
                            var dashboards = data[category];
                            if (dashboards.length > 0) {
                                dashboards = dashboards.filter(function (dash) { return dash && dash !== ''; });
                                var item = {
                                    id: idCounter++,
                                    name: category,
                                    dashboards: dashboards
                                };
                                // sort 
                                if (angular.isFunction(_this.$izendaDashboardConfig.dashboardToolBarItemsSort))
                                    item.dashboards.sort(function (item1, item2) { return _this.$izendaDashboardConfig.dashboardToolBarItemsSort(item1, item2); });
                                newCategories.push(item);
                            }
                        }
                    }
                    _this.categories.onNext(newCategories, _this);
                    resolve(_this.categories);
                }, function (error) {
                    var errorMessage = _this.$izendaLocaleService.localeText('js_DashboardLoadCatsError', 'Failed to get dashboard categories');
                    reject(errorMessage + ": " + error);
                });
            });
        };
        DashboardStorageService.prototype._setFiltersRefreshCascadingInterceptor = function () {
            var _this = this;
            window.cascadingFiltersChangedCustomContext = this;
            // turn off legacy filters queries: we'll do it by ourselves.
            window.cascadingFiltersChangedCustom = function () {
                if (angular.isFunction(CascadingFiltersChanged)) {
                    window.refreshFiltersLastGUID = GenerateGuid();
                    var json = _this.createJsonConfigForSend();
                    _this.$izendaDashboardQueryService.syncFiltersNew(json).then(function (filtersData) {
                        CascadingFiltersChanged(filtersData, "refreshcascadingfilters-" + window.refreshFiltersLastGUID);
                    });
                }
            };
        };
        DashboardStorageService.prototype._setFiltersData = function (filtersData) {
            // set legacy filters from response
            if (angular.isFunction(GotFiltersData)) {
                GotFiltersData(angular.isObject(filtersData)
                    ? filtersData
                    : {
                        Filters: [],
                        SubreportsFilters: [],
                        FilterLogic: ''
                    }, 'getfiltersdata');
            }
        };
        /**
         * Load dashboard config from the server and fill dashboard model.
         * @param {string} reportFullName dashboard report full name.
         * @param {boolean} updateFromSource is reload tiles from its sources required?
         */
        DashboardStorageService.prototype.loadDashboardInternal = function (reportFullName, updateFromSource) {
            var _this = this;
            this._updateCurrentCategory(); // update category objects
            // start loading
            this.isLoaded.onNext(false, this);
            this.$izendaDashboardQueryService.loadDashboardNew(reportFullName, !!updateFromSource).then(function (dashboardModel) {
                if (!angular.isObject(dashboardModel))
                    throw "Failed to load dashboard '" + reportFullName + "'";
                // set current rights
                _this.$izendaCompatibilityService.setRights(dashboardModel.effectiveRights);
                _this.$izendaCompatibilityService.setUsesHiddenColumns(dashboardModel.usesHiddenColumns);
                // update names
                dashboardModel.reportFullName = _this.$izendaSettingsService.getReportFullName(dashboardModel.reportName, dashboardModel.reportCategory);
                dashboardModel.tiles.forEach(function (tile) {
                    tile.reportName = _this.$izendaUrlService.extractReportName(tile.reportSetName);
                    tile.reportCategory = _this.$izendaUrlService.extractReportCategory(tile.reportSetName);
                });
                // set legacy filters from response
                _this._setFiltersData(dashboardModel.filters);
                // notify that model was changed and report was loaded
                _this.model.onNext(dashboardModel, _this);
                // show hidden columns warning
                if (_this.$izendaCompatibilityService.isUsesHiddenColumns()) {
                    _this.$izendaUtilUiService.showMessageDialog(_this.$izendaLocaleService.localeText('js_dashboardUsesHiddenColumns', 'Dashboard contains tile with report which contains unavailable fields. Please re-save original report or chose another one.'));
                }
                _this.isLoaded.onNext(true, _this);
            }, function (error) {
                var errorMessage = _this.$izendaLocaleService.localeText('js_LayoutLoadError', 'Failed to load dashboard layout');
                _this.$izendaUtilUiService.showErrorDialog(errorMessage + ": " + error);
            });
        };
        /**
         * Create new dashboard.
         */
        DashboardStorageService.prototype._newDashboard = function () {
            var _this = this;
            this._updateCurrentCategory(); // update category objects
            this.$izendaCompatibilityService.setRights('Full Access');
            var newModelInstance = dashboard_model_2.IzendaDashboardModel.createInstance(true);
            var schedulePromise = this.$izendaScheduleService.setScheduleConfig(null);
            var sharePromise = this.$izendaShareService.setShareConfig(null);
            this.$q.all([schedulePromise, sharePromise]).then(function () {
                _this.model.onNext(newModelInstance, _this);
                _this.isLoaded.onNext(true, _this);
            });
        };
        Object.defineProperty(DashboardStorageService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        DashboardStorageService.register = function (module) {
            module.service('$izendaDashboardStorageService', DashboardStorageService.injectModules.concat(DashboardStorageService));
        };
        return DashboardStorageService;
    }());
    exports.default = DashboardStorageService;
});
izendaRequire.define("dashboard/directives/dashboard-background", ["require", "exports", "angular", "dashboard/module-definition"], function (require, exports, angular, module_definition_24) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Dashboard background directive. Used to set background color, image and hue rotate.
     */
    var IzendaDashboardBackground = /** @class */ (function () {
        function IzendaDashboardBackground($window) {
            this.$window = $window;
            this.restrict = 'E';
            this.scope = {
                backgroundColor: '=',
                backgroundImage: '=',
                backgroundImageRepeat: '=',
                hueRotate: '='
            };
            IzendaDashboardBackground.prototype.link = function ($scope, $element, attrs) {
                var id = String(Math.random());
                var oldMouseX = 0;
                var oldMouseY = 0;
                var degree = 0;
                // ensure background was added
                var $background = angular.element('body > .iz-dash-background');
                var $dashboardsDiv = angular.element('#izendaDashboardMainContainer');
                if ($background.length === 0) {
                    $background = angular.element('<div class="iz-dash-background"></div>');
                    angular.element('body').prepend($background);
                }
                // Update background
                var updateBackground = function () {
                    $background = angular.element('body > .iz-dash-background');
                    if ($scope.backgroundImage)
                        $background.css('background', "url('" + $scope.backgroundImage + "')");
                    else
                        $background.css('background', '');
                    if ($scope.backgroundImageRepeat) {
                        $background.css('background-repeat', 'repeat');
                        $background.css('background-size', 'initial');
                    }
                    else {
                        $background.css('background-repeat', '');
                        $background.css('background-size', '');
                    }
                    if ($scope.backgroundColor)
                        $background.css('background-color', $scope.backgroundColor);
                    else
                        $background.css('background-color', '');
                };
                // set background position
                var setBackgroundPosition = function () {
                    var newBackgroundTop = $dashboardsDiv.offset().top + 50 - angular.element($window).scrollTop();
                    if (newBackgroundTop < 0)
                        newBackgroundTop = 0;
                    $background.css({
                        '-moz-background-position-y': newBackgroundTop + 'px',
                        '-o-background-position-y': newBackgroundTop + 'px',
                        'background-position-y': newBackgroundTop + 'px'
                    });
                };
                // Hue can use rotate
                var isToggleHueRotateEnabled = function () {
                    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
                    var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
                    var isFirefox = /Firefox/.test(navigator.userAgent);
                    return isChrome || isSafari || isFirefox;
                };
                // Turn off background hue rotate
                var resetRotate = function () {
                    clearTimeout($window.hueRotateTimeOut);
                    $background.css({ '-webkit-filter': 'hue-rotate(' + '0' + 'deg)' });
                    $background.css({ '-moz-filter': 'hue-rotate(' + '0' + 'deg)' });
                    $background.css({ '-o-filter': 'hue-rotate(' + '0' + 'deg)' });
                    $background.css({ '-ms-filter': 'hue-rotate(' + '0' + 'deg)' });
                    $background.css({ 'filter': 'hue-rotate(' + '0' + 'deg)' });
                };
                // Run hue rotate
                var rotate = function () {
                    if (!isToggleHueRotateEnabled())
                        return;
                    $background.css({ '-webkit-filter': 'hue-rotate(' + degree + 'deg)' });
                    $background.css({ '-moz-filter': 'hue-rotate(' + degree + 'deg)' });
                    $background.css({ '-o-filter': 'hue-rotate(' + degree + 'deg)' });
                    $background.css({ '-ms-filter': 'hue-rotate(' + degree + 'deg)' });
                    $background.css({ 'filter': 'hue-rotate(' + degree + 'deg)' });
                    $window.hueRotateTimeOut = setTimeout(function () {
                        var addPath;
                        var dx = ($window.mouseX - oldMouseX);
                        var dy = ($window.mouseY - oldMouseY);
                        addPath = Math.sqrt(dx * dx + dy * dy);
                        var wndPath = Math.sqrt($window.innerHeight * $window.innerHeight + $window.innerWidth * $window.innerWidth);
                        addPath = addPath * 360 / wndPath;
                        oldMouseX = $window.mouseX;
                        oldMouseY = $window.mouseY;
                        if (isNaN(addPath))
                            addPath = 0;
                        degree += 6 + addPath;
                        while (degree > 360)
                            degree -= 360;
                        rotate();
                    }, 100);
                };
                // run background
                setBackgroundPosition();
                angular.element($window).on('scroll.' + id, function () { return setBackgroundPosition(); });
                updateBackground();
                // watch bindings changed
                $scope.$watch('backgroundColor', function () { return updateBackground(); });
                $scope.$watch('backgroundImage', function () { return updateBackground(); });
                $scope.$watch('backgroundImageRepeat', function () { return updateBackground(); });
                $scope.$watch('hueRotate', function (newVal) {
                    if (newVal)
                        rotate();
                    else
                        resetRotate();
                });
                // destruction method
                $element.on('$destroy', function () {
                    angular.element($window).off('scroll.' + id);
                });
            };
        }
        IzendaDashboardBackground.factory = function () {
            var directive = function ($window) { return new IzendaDashboardBackground($window); };
            directive.$inject = ['$window'];
            return directive;
        };
        return IzendaDashboardBackground;
    }());
    module_definition_24.default.directive('izendaDashboardBackground', ['$window', IzendaDashboardBackground.factory()]);
});
izendaRequire.define("dashboard/directives/tile-top-slider", ["require", "exports", "angular", "dashboard/module-definition"], function (require, exports, angular, module_definition_25) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Slider for selecting top value.
     */
    var IzendaTileTopSlider = /** @class */ (function () {
        function IzendaTileTopSlider() {
            this.restrict = 'A';
            this.require = ['ngModel'];
            this.scope = {
                disabled: '=',
                rendered: '=',
                ngModel: '=',
                showItemAll: '=',
                onChangeEnd: '&'
            };
            this.template = '<input></input>';
            IzendaTileTopSlider.prototype.link = function ($scope, $element, attrs) {
                var slider = null;
                // initialize values array
                var valuesArray = [];
                for (var i = 1; i <= 10; i++)
                    valuesArray.push(i);
                for (var j = 20; j <= 100; j = j + 10)
                    valuesArray.push(j);
                valuesArray.push(250);
                valuesArray.push(500);
                valuesArray.push(1000);
                valuesArray.push(5000);
                valuesArray.push(10000);
                valuesArray.push('ALL');
                // convert value from values array to the number
                var convertFromToValue = function (valuesArrayIndex) {
                    var val = valuesArray[valuesArrayIndex];
                    if (val === 'ALL')
                        val = -1;
                    return Number(val);
                };
                // add new value to the valuesArray
                var appendValueToFromArray = function (value) {
                    var index = value > 0 ? valuesArray.indexOf(value) : valuesArray.indexOf('ALL');
                    if (index >= 0)
                        return false;
                    var updatedArray = [];
                    valuesArray.forEach(function (currValue) {
                        if (currValue > value && updatedArray.indexOf(value) < 0)
                            updatedArray.push(value);
                        updatedArray.push(currValue);
                    });
                    valuesArray = updatedArray;
                    return true;
                };
                // convert number into values array value and return index of the found value.
                var convertAndGetValuesArrayIndex = function (value) {
                    var index = value > 0 ? valuesArray.indexOf(value) : valuesArray.indexOf('ALL');
                    if (index < 0)
                        index = valuesArray.indexOf('ALL');
                    return index;
                };
                // initialize slider
                var initializeSlider = function () {
                    var $input = $element.children('input');
                    appendValueToFromArray($scope.ngModel); // add current value to the valuesArray if no exist.
                    $input.val('');
                    $input['ionRangeSlider']({
                        disable: $scope.disabled,
                        grid: true,
                        hide_min_max: true,
                        from: convertAndGetValuesArrayIndex($scope.ngModel),
                        values: valuesArray,
                        onFinish: function (data) {
                            var value = convertFromToValue(data.from);
                            if (angular.isFunction($scope.onChangeEnd))
                                $scope.onChangeEnd({ newTop: value });
                        }
                    });
                    slider = $input.data("ionRangeSlider");
                };
                // Set value to slider
                var setSliderValue = function (value) {
                    if (!slider)
                        return;
                    // add value to the values array if not exist.
                    if (appendValueToFromArray(value))
                        slider.update({
                            values: valuesArray
                        });
                    var from = convertAndGetValuesArrayIndex(value);
                    slider.update({
                        from: from
                    });
                };
                // watches: 
                $scope.$watch('ngModel', function (newValue) { return setSliderValue(newValue); });
                $scope.$watch('showItemAll', function (value) {
                    var isAllElementExists = valuesArray.indexOf('ALL') >= 0;
                    if (isAllElementExists && !value)
                        valuesArray.pop();
                    else if (!isAllElementExists && value)
                        valuesArray.push('ALL');
                    if (slider)
                        slider.update({
                            values: valuesArray
                        });
                });
                $scope.$watch('rendered', function (value) {
                    if (value)
                        initializeSlider();
                    else if (slider) {
                        slider.destroy();
                        slider = null;
                    }
                });
                $scope.$watch('disabled', function (value) {
                    if (slider)
                        slider.update({
                            disable: value
                        });
                });
                // destruction method
                $element.on('$destroy', function () {
                    if (slider) {
                        slider.destroy();
                        slider = null;
                    }
                });
            };
        }
        IzendaTileTopSlider.factory = function () {
            return function () { return new IzendaTileTopSlider(); };
        };
        return IzendaTileTopSlider;
    }());
    module_definition_25.default.directive('izendaTileTopSlider', [IzendaTileTopSlider.factory()]);
});
izendaRequire.define("dashboard/directives/toolbar-folder-menu-accordion", ["require", "exports", "angular", "dashboard/module-definition"], function (require, exports, angular, module_definition_26) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Dashboard toolbar with ability to scroll. Used for navigation between dashboards.
     */
    var IzendaToolbarFolderMenuAccordion = /** @class */ (function () {
        function IzendaToolbarFolderMenuAccordion($timeout, $izendaUrlService, $izendaUtilService) {
            this.$timeout = $timeout;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaUtilService = $izendaUtilService;
            this.restrict = 'A';
            this.scope = {
                categories: '='
            };
            this.templateUrl = '###RS###extres=components.dashboard.directives.toolbar-folder-menu-accordion.html';
            IzendaToolbarFolderMenuAccordion.prototype.link = function ($scope, $element, attrs) {
                // add category 'in' class for currentCategory
                $scope.getCategoryClass = function (index) {
                    return $izendaUtilService.isCategoriesEqual($scope.categories[index].name, $izendaUrlService.getReportInfo().category) ? 'in' : '';
                };
                // get category item activated or not class
                $scope.getCategoryItemClass = function (itemName) {
                    return itemName === $izendaUrlService.getReportInfo().fullName ? 'active' : '';
                };
                // remove category part from report name
                $scope.extractReportName = function (fullName) { return $izendaUrlService.extractReportName(fullName); };
                // navigate to dashboard
                $scope.goToDashboard = function (dashboard) { return $izendaUrlService.setReportFullName(dashboard); };
                // toggle accordion handler
                $scope.toggleAccordion = function (index) {
                    var $categoryContainer = angular.element($element.children()[index]);
                    var $category = $categoryContainer.find('.category');
                    if ($category.hasClass('in'))
                        $category.removeClass('in');
                    else
                        $category.addClass('in');
                    if ($category.hasClass('in'))
                        $categoryContainer.closest('.iz-dash-dashboards-dropdown-container').animate({
                            scrollTop: $categoryContainer.position().top - $categoryContainer.parent().position().top
                        }, 500);
                };
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaToolbarFolderMenuAccordion.factory = function () {
            var directive = function ($timeout, $izendaUrlService, $izendaUtilService) {
                return new IzendaToolbarFolderMenuAccordion($timeout, $izendaUrlService, $izendaUtilService);
            };
            directive.$inject = ['$timeout', '$izendaUrlService', '$izendaUtilService'];
            return directive;
        };
        return IzendaToolbarFolderMenuAccordion;
    }());
    module_definition_26.default.directive('izendaToolbarFolderMenuAccordion', ['$timeout', '$izendaUrlService', '$izendaUtilService',
        IzendaToolbarFolderMenuAccordion.factory()]);
});
izendaRequire.define("dashboard/directives/toolbar-links-panel", ["require", "exports", "angular", "dashboard/module-definition"], function (require, exports, angular, module_definition_27) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Dashboard toolbar with ability to scroll. Used for navigation between dashboards.
     */
    var IzendaToolbarLinksPanel = /** @class */ (function () {
        function IzendaToolbarLinksPanel($timeout, $window) {
            this.$timeout = $timeout;
            this.$window = $window;
            this.restrict = 'A';
            this.scope = {
                toolbarItems: '=',
                toolbarActiveItem: '=',
                toolbarActiveItemChangeCounter: '=',
                onClick: '&',
                equalsFunc: '&',
                getTitle: '&'
            };
            this.templateUrl = '###RS###extres=components.dashboard.directives.toolbar-links-panel.html';
            IzendaToolbarLinksPanel.prototype.link = function ($scope, $element, attrs) {
                var $slideScrollContainer = angular.element($element).find('.iz-dash-linkspanel-navbar-2');
                var $slideContainer = angular.element($element).find('.iz-dash-linkspanel-navbar-3');
                var getMinLeft = function () { return $slideScrollContainer.width() - $slideContainer.width() - 80; };
                var getMaxLeft = function () { return 0; };
                var setLeftValue = function (value) {
                    $slideContainer.css('transform', 'translate3d(' + Math.floor(value) + 'px, 0px, 0px)');
                    $slideContainer.attr('transform-left', Math.floor(value));
                };
                var respectEdges = function (position) {
                    var result = position;
                    result = Math.max(result, getMinLeft());
                    result = Math.min(result, getMaxLeft());
                    return result;
                };
                // move toolbar buttons left or right
                var moveMenuItems = function (leftDelta) {
                    var leftString = $slideContainer.attr('transform-left');
                    var leftNumber = 0;
                    if (angular.isString(leftString))
                        leftNumber = parseInt(leftString);
                    leftNumber += leftDelta;
                    leftNumber = respectEdges(leftNumber);
                    setLeftValue(leftNumber);
                };
                // move to item
                $scope.moveTo = function (item) {
                    if (!$scope.toolbarItems)
                        return;
                    var itemToMove = item;
                    if (!itemToMove && $scope.toolbarItems.length > 0)
                        itemToMove = $scope.toolbarItems[$scope.toolbarItems.length - 1];
                    if (itemToMove) {
                        var $item = angular.element($element).find('#izDashToolbarItem' + itemToMove.id);
                        var itemLeft = $item.position().left + $item.width() / 2;
                        var leftNumber = $slideScrollContainer.width() / 2 - itemLeft;
                        leftNumber = respectEdges(leftNumber);
                        setLeftValue(leftNumber);
                    }
                };
                // move right button
                $scope.moveRight = function () { return moveMenuItems(-500); };
                // move left button
                $scope.moveLeft = function () { return moveMenuItems(500); };
                // get active li class 
                $scope.getLiClass = function (item) { return $scope.equalsFunc({ arg0: item, arg1: $scope.toolbarActiveItem }) ? 'active' : ''; };
                // check left and right buttons is needed
                $scope.isButtonsVisible = function () {
                    if ($scope.refreshButtonsWidth) {
                        $scope.sumWidth = 0;
                        $slideContainer.find('.iz-dash-linkspanel-navbar-item').each(function (iNavbarItem, navbarItem) {
                            $scope.sumWidth += angular.element(navbarItem).width();
                        });
                        $scope.refreshButtonsWidth = false;
                    }
                    var width = $slideScrollContainer.width();
                    return width && $scope.sumWidth > width;
                };
                // watch toolbar item collection changed
                $scope.$watchCollection('toolbarItems', function () {
                    $scope.refreshButtonsWidth = true;
                    $slideContainer.find('.iz-dash-linkspanel-navbar-item').on('click', function (e) {
                        var idStr = String(angular.element(e.delegateTarget).attr('id'));
                        var id = parseInt(idStr.split('izDashToolbarItem')[1]);
                        var item = $scope.toolbarItems.find(function (toolbarItem) { return toolbarItem.id === id; }) || null;
                        $scope.moveTo(item);
                        $scope.onClick({ arg0: item });
                        $scope.$applyAsync();
                    });
                });
                // watch active item changed
                $scope.$watch('toolbarActiveItemChangeCounter', function () {
                    $timeout(function () {
                        $scope.moveTo($scope.toolbarActiveItem);
                        $scope.$parent.$eval(attrs.toolbarActiveItem);
                    }, 0);
                });
                // watch active item changed
                $scope.$watch('toolbarActiveItem', function () {
                    $timeout(function () {
                        $scope.moveTo($scope.toolbarActiveItem);
                        $scope.$parent.$eval(attrs.toolbarActiveItem);
                    }, 0);
                });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaToolbarLinksPanel.factory = function () {
            var directive = function ($timeout, $window) { return new IzendaToolbarLinksPanel($timeout, $window); };
            directive.$inject = ['$timeout', '$window'];
            return directive;
        };
        return IzendaToolbarLinksPanel;
    }());
    module_definition_27.default.directive('izendaToolbarLinksPanel', ['$timeout', '$window', IzendaToolbarLinksPanel.factory()]);
});
izendaRequire.define("dashboard/components/tile/tile-draggable-directive", ["require", "exports", "angular", "dashboard/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_28) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Directive provides move function for dashboard tile.
     */
    var IzendaTileDraggable = /** @class */ (function () {
        function IzendaTileDraggable($rootScope, $timeout, $izendaDashboardStorageService) {
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.$izendaDashboardStorageService = $izendaDashboardStorageService;
            this.restrict = 'E';
            this.scope = {
                enabled: '=',
                gridWidth: '=',
                gridHeight: '=',
                tile: '=',
                tiles: '=',
                onMove: '&',
                onMoveStart: '&',
                onMoveEnd: '&'
            };
            IzendaTileDraggable.prototype.link = function ($scope, $element) {
                var getTileByTile$ = function ($t) {
                    if (!$t || !angular.isArray($scope.tiles))
                        return null;
                    var tileid = Number($t.attr('tileid'));
                    return $scope.tiles.find(function (t) { return t.id === tileid; }) || null;
                };
                /**
                 * Find tile which contain point {x,y}
                 */
                var getUnderlyingTile$ = function (left, top, $tiles) {
                    if (!angular.isArray($scope.tiles))
                        return null;
                    var result = $tiles.find(function ($currentTile, currentTileIndex) {
                        var tileOffset = $currentTile.offset();
                        var currentTile = $scope.tiles[currentTileIndex];
                        if ($scope.tile.id === currentTile.id)
                            return false;
                        return tileOffset.left <= left
                            && left <= tileOffset.left + $currentTile.width()
                            && tileOffset.top <= top
                            && top <= tileOffset.top + $currentTile.height();
                    });
                    return result || null;
                };
                /**
                 * Check tile intersects to any other tile
                 */
                var checkTileIntersects = function ($helper) {
                    var hitTest = function (a, otherTile, accuracyX, accuracyY) {
                        var aPos = a.position();
                        var aTop = aPos.top > 0 ? aPos.top : 0;
                        var aBottom = aTop + a.height();
                        var aLeft = aPos.left > 0 ? aPos.left : 0;
                        var aRight = aLeft + a.width();
                        if (aRight / $scope.gridWidth > 12) {
                            var delta = aRight - $scope.gridWidth * 12;
                            aLeft -= delta;
                            aRight = $scope.gridWidth * 12;
                        }
                        var bLeft = otherTile.x * $scope.gridWidth + accuracyX;
                        var bTop = otherTile.y * $scope.gridHeight + accuracyY;
                        var bRight = (otherTile.x + otherTile.width) * $scope.gridWidth - accuracyX;
                        var bBottom = (otherTile.y + otherTile.height) * $scope.gridHeight - accuracyY;
                        return !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
                    };
                    var result = false;
                    $scope.tiles.forEach(function (oTile) {
                        if (oTile.id === $scope.tile.id)
                            return;
                        if (hitTest($helper, oTile, $scope.gridWidth / 2, $scope.gridHeight / 2))
                            result = true;
                    });
                    return result;
                };
                /**
                 * Get snapped to grid bbox.
                 */
                var getTargetBbox = function (helperLeft, helperTop, helperWidth, helperHeight) {
                    // calculate tile shadow position
                    var x = Math.round(helperLeft / $scope.gridWidth) * $scope.gridWidth;
                    var y = Math.round(helperTop / $scope.gridHeight) * $scope.gridHeight;
                    var helperBbox = {
                        left: x,
                        top: y,
                        width: helperWidth,
                        height: helperHeight
                    };
                    return helperBbox;
                };
                var $tile = $element.closest('.iz-dash-tile');
                var previousHelperBbox = { left: 0, top: 0, width: 0, height: 0 };
                var helperWidth = 0;
                var helperHeight = 0;
                var $tileFlippies;
                var $tilesArray = [];
                // init draggable
                $tile['draggable']({
                    stack: '.iz-dash-tile',
                    handle: '.title-container, .iz-dash-select-report-front-container',
                    distance: 10,
                    helper: function () {
                        var width = $scope.tile.width * $scope.gridWidth;
                        var height = $scope.tile.height * $scope.gridHeight;
                        var helperStr = "<div class=\"iz-dash-tile iz-dash-tile-helper\" style=\"z-index:1000;top:0;left:0;height:" + height + "px;width:" + width + "px;opacity:1;transform:matrix(1,0,0,1,0,0);\">\n\t<div class=\"animate-flip\">\n\t\t<div class=\"flippy flippy-front animated fast\">\n\t\t\t<div class=\"title-container\" style=\"height: 35px; overflow: hidden;\"><div class=\"title\"><span class=\"title-text\"></span></div></div>\n\t\t</div>\n\t</div>\n</div>";
                        return angular.element(helperStr);
                    },
                    start: function (event, ui) {
                        $tileFlippies = $tile.children('.animate-flip').children('.flippy');
                        $scope.tiles.forEach(function (tile) {
                            tile.backTilePopupOpened = false;
                        });
                        // turn off window resize handler
                        $izendaDashboardStorageService.turnOffWindowResizeHandler();
                        // update tiles array;
                        $tilesArray = $scope.tiles.map(function (currentTile) { return angular.element(".iz-dash-tile[tileid=" + currentTile.id + "]"); });
                        $tile = $element.closest('.iz-dash-tile');
                        // fire onMoveStart handler:
                        if (angular.isFunction($scope.onMoveStart))
                            $scope.onMoveStart({ tile: $scope.tile });
                        // prepare helper:
                        var $helper = ui.helper;
                        helperWidth = $helper.width();
                        helperHeight = $helper.height();
                        var $helperFlipFront = $helper.find('.flippy-front');
                        $helperFlipFront.removeClass('flipInY');
                        $helperFlipFront.removeClass('animated');
                        $helperFlipFront.removeClass('fast');
                        $helperFlipFront.css('background-color', 'rgba(50,205,50, 0.3)');
                        $helperFlipFront.find('.frame').remove();
                        $helper.css('z-index', 1000);
                        $helper.css('opacity', 1);
                    },
                    drag: function (event, ui) {
                        var $helper = ui.helper;
                        var $helperFlipFront = $helper.find('.flippy-front');
                        // calculate tile shadow position
                        var helperPos = $helper.position();
                        var helperBbox = getTargetBbox(helperPos.left, helperPos.top, helperWidth, helperHeight);
                        $helperFlipFront.css('background-color', 'rgba(50,205,50, 0.3)'); // semi-transparent green
                        // check underlying tile
                        if (angular.isArray($scope.tiles)) {
                            $scope.tiles.forEach(function (currentTile) {
                                currentTile.backgroundColor = '#fff';
                            });
                            var targetTile = getTileByTile$(getUnderlyingTile$(event.pageX, event.pageY, $tilesArray));
                            if (targetTile)
                                // highlight tile for swap
                                targetTile.backgroundColor = 'rgba(50,205,50, 1)';
                            else if (checkTileIntersects($helper))
                                $helperFlipFront.css('background-color', 'rgba(220,20,60,0.2)');
                        }
                        // prevent duplicate calls
                        if (previousHelperBbox.left === helperBbox.left &&
                            previousHelperBbox.top === helperBbox.top &&
                            previousHelperBbox.width === helperBbox.width &&
                            previousHelperBbox.height === helperBbox.height) {
                            $scope.$applyAsync();
                            return;
                        }
                        previousHelperBbox = helperBbox;
                        // fire onMove handler:
                        if (angular.isFunction($scope.onMove)) {
                            $scope.onMove({
                                tile: $scope.tile,
                                shadowPosition: helperBbox
                            });
                        }
                        $scope.$applyAsync();
                    },
                    stop: function (event, ui) {
                        var $helper = ui.helper;
                        // return default tile color
                        if (angular.isArray($scope.tiles)) {
                            $scope.tiles.forEach(function (currentTile) {
                                currentTile.backgroundColor = '';
                            });
                        }
                        $scope.tile.backgroundColor = '';
                        var $animatedTiles = [];
                        var eventResult = {
                            type: 'none',
                            isTileSizeChanged: false,
                            tile: $scope.tile,
                            targetTile: getTileByTile$(getUnderlyingTile$(event.pageX, event.pageY, $tilesArray))
                        };
                        if (eventResult.targetTile) {
                            // swap tiles
                            eventResult.type = 'swap';
                            eventResult.isTileSizeChanged = $scope.tile.width !== eventResult.targetTile.width ||
                                $scope.tile.height !== eventResult.targetTile.height;
                            // exchange sizes
                            var tileChangeObject = {
                                x: $scope.tile.x,
                                y: $scope.tile.y,
                                width: $scope.tile.width,
                                height: $scope.tile.height
                            };
                            // set new size for current tile:
                            $scope.tile.x = eventResult.targetTile.x;
                            $scope.tile.y = eventResult.targetTile.y;
                            $scope.tile.width = eventResult.targetTile.width;
                            $scope.tile.height = eventResult.targetTile.height;
                            // set new size for target tile
                            eventResult.targetTile.x = tileChangeObject.x;
                            eventResult.targetTile.y = tileChangeObject.y;
                            eventResult.targetTile.width = tileChangeObject.width;
                            eventResult.targetTile.height = tileChangeObject.height;
                            // run animation:
                            // clear tile content for smooth animation
                            [$scope.tile, eventResult.targetTile].forEach(function (affectedTile) {
                                var $affectedTile = angular.element('.iz-dash-tile[tileid=' + affectedTile.id + ']');
                                $affectedTile.addClass('transition');
                                $animatedTiles.push($affectedTile);
                            });
                        }
                        else if (!checkTileIntersects($helper)) {
                            eventResult.type = 'move';
                            var helperPos = $helper.position();
                            var helperBbox = getTargetBbox(helperPos.left, helperPos.top, helperWidth, helperHeight);
                            $scope.tile.x = Math.round(helperBbox.left / $scope.gridWidth);
                            $scope.tile.y = Math.round(helperBbox.top / $scope.gridHeight);
                            $scope.tile.width = Math.round(helperBbox.width / $scope.gridWidth);
                            $scope.tile.height = Math.round(helperBbox.height / $scope.gridHeight);
                            if ($scope.tile.x < 0)
                                $scope.tile.x = 0;
                            if ($scope.tile.y < 0)
                                $scope.tile.y = 0;
                            if ($scope.tile.x + $scope.tile.width > 12) {
                                $scope.tile.x = 12 - $scope.tile.width;
                                eventResult.isTileSizeChanged = true;
                            }
                            // run animation for current tile:
                            var $t = angular.element('.iz-dash-tile[tileid=' + $scope.tile.id + ']');
                            $t.addClass('transition');
                            $animatedTiles.push($t);
                        }
                        $animatedTiles.forEach(function ($t) {
                            $t.find('.report').hide();
                        });
                        $scope.$applyAsync();
                        setTimeout(function () {
                            $animatedTiles.forEach(function ($t) {
                                $t.removeClass('transition');
                            });
                            $tile.css('z-index', '1');
                            $tile.find('.frame').removeClass('hidden');
                            $tileFlippies.removeClass('flipInY');
                            $tileFlippies.removeClass('animated');
                            $tileFlippies.removeClass('fast');
                            setTimeout(function () {
                                $animatedTiles.forEach(function ($t) {
                                    $t.find('.report').show();
                                });
                                // turn on window resize handler
                                $izendaDashboardStorageService.turnOnWindowResizeHandler();
                                // fire onMoveEnd handler:
                                if (angular.isFunction($scope.onMoveEnd)) {
                                    $scope.onMoveEnd({ eventResult: eventResult });
                                }
                                $scope.$applyAsync();
                            }, 100);
                        }, 300);
                    }
                });
                // handlers
                $scope.$watch('enabled', function (enabled, prevEnabled) {
                    if (enabled === prevEnabled)
                        return;
                    $tile['draggable'](enabled ? 'enable' : 'disable');
                });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaTileDraggable.factory = function () {
            var directive = function ($rootScope, $timeout, $izendaDashboardStorageService) {
                return new IzendaTileDraggable($rootScope, $timeout, $izendaDashboardStorageService);
            };
            directive.$inject = ['$rootScope', '$timeout', '$izendaDashboardStorageService'];
            return directive;
        };
        return IzendaTileDraggable;
    }());
    module_definition_28.default.directive('izendaTileDraggable', ['$rootScope', '$timeout', '$izendaDashboardStorageService', IzendaTileDraggable.factory()]);
});
izendaRequire.define("dashboard/components/tile/tile-flip-directive", ["require", "exports", "angular", "dashboard/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_29) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Tile flip directive. Flips tile and calls handler.
     */
    var IzendaTileFlip = /** @class */ (function () {
        function IzendaTileFlip($timeout) {
            this.$timeout = $timeout;
            this.restrict = 'A';
            this.scope = {
                flipObject: '=izendaTileFlipObject',
                flipHandler: '&izendaTileFlipHandler'
            };
            IzendaTileFlip.prototype.link = function ($scope, $element) {
                var getFlippyFront = function () { return $element.children('.animate-flip').children('.flippy-front'); };
                var getFlippyBack = function () { return $element.children('.animate-flip').children('.flippy-back'); };
                var flipTileFront = function (update, updateFromSourceReport) {
                    var showClass = 'animated fast flipInY';
                    var hideClass = 'animated fast flipOutY';
                    var $front = getFlippyFront();
                    var $back = getFlippyBack();
                    $element.children('.ui-resizable-handle').hide();
                    $back.addClass(hideClass);
                    $front.removeClass(showClass);
                    $front.css('display', 'block').addClass(showClass);
                    $back.css('display', 'none').removeClass(hideClass);
                    $timeout(function () {
                        $front.removeClass('flipInY');
                        $back.removeClass('flipInY');
                        $element.children('.ui-resizable-handle').fadeIn(200);
                    }, 200).then(function () {
                        // call handler
                        if (angular.isFunction($scope.flipHandler))
                            $scope.flipHandler({
                                isFront: true,
                                update: update,
                                updateFromSourceReport: updateFromSourceReport
                            });
                    });
                };
                var flipTileBack = function () {
                    var showClass = 'animated fast flipInY';
                    var hideClass = 'animated fast flipOutY';
                    var $front = getFlippyFront();
                    var $back = getFlippyBack();
                    $element.children('.ui-resizable-handle').hide();
                    $front.addClass(hideClass);
                    $back.removeClass(showClass);
                    $back.css('display', 'block').addClass(showClass);
                    $front.css('display', 'none').removeClass(hideClass);
                    $timeout(function () {
                        $front.removeClass('flipInY');
                        $back.removeClass('flipInY');
                        $element.children('.ui-resizable-handle').fadeIn(200);
                    }, 200).then(function () {
                        // call handler
                        if (angular.isFunction($scope.flipHandler)) {
                            $scope.flipHandler({
                                isFront: false
                            });
                        }
                    });
                };
                $scope.$watch('flipObject', function (newValue, oldValue) {
                    if (oldValue === newValue)
                        return;
                    if (newValue.isFront)
                        flipTileFront(newValue.update, newValue.updateFromSourceReport);
                    else
                        flipTileBack();
                });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaTileFlip.factory = function () {
            var directive = function ($timeout) { return new IzendaTileFlip($timeout); };
            directive.$inject = ['$timeout'];
            return directive;
        };
        return IzendaTileFlip;
    }());
    module_definition_29.default.directive('izendaTileFlip', ['$timeout', IzendaTileFlip.factory()]);
});
izendaRequire.define("dashboard/components/tile/tile-hover-directive", ["require", "exports", "angular", "dashboard/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_30) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Tile hover directive. Adds onHover event handler to tile.
     */
    var IzendaTileHover = /** @class */ (function () {
        function IzendaTileHover($window) {
            this.$window = $window;
            this.restrict = 'A';
            IzendaTileHover.prototype.link = function ($scope, $element, attrs) {
                var uid = Math.floor(Math.random() * 1000000);
                var windowMouseMoveEventName = "mousemove.tilehover" + uid;
                var isHoveringOverTile = false;
                var isHoverLocked = false;
                // set hover classes func
                var applyTileHover = function ($tile, isHoveringNow) {
                    var reportComplexityCoefficent = $scope.$eval(attrs.izendaTileHoverReportComplexity);
                    if (isHoverLocked && reportComplexityCoefficent < 0.5)
                        return;
                    if (isHoveringNow) {
                        $tile.addClass('hover');
                        $tile.removeClass('no-hover-overflow');
                    }
                    else {
                        $tile.addClass('no-hover-overflow');
                        $tile.removeClass('hover');
                    }
                };
                // hover event handlers
                $element.hover(function () {
                    applyTileHover($element, true);
                }, function () {
                    applyTileHover($element, false);
                });
                // window mouse move event handlers
                angular.element($window).on(windowMouseMoveEventName, function (e) {
                    var $tileElement = angular.element(e.target).closest('div.iz-dash-tile');
                    var overTile = $tileElement.length > 0 && $tileElement.attr('tileid') == $element.attr('tileid');
                    if (overTile !== isHoveringOverTile) {
                        applyTileHover($element, overTile);
                    }
                    isHoveringOverTile = overTile;
                });
                $scope.$watch('$ctrl.tile.backTilePopupOpened', function (newVal, oldVal) {
                    if (!newVal && oldVal) {
                        // backTilePopupOpened turned off
                        isHoverLocked = false;
                        applyTileHover($element, isHoveringOverTile);
                    }
                    else if (newVal && !oldVal) {
                        // backTilePopupOpened turned on
                        applyTileHover($element, true);
                        isHoverLocked = true;
                    }
                });
                // destruction method
                $element.on('$destroy', function () {
                    $element.off('hover');
                    angular.element($window).off(windowMouseMoveEventName);
                });
            };
        }
        IzendaTileHover.factory = function () {
            var directive = function ($window) { return new IzendaTileHover($window); };
            directive.$inject = ['$window'];
            return directive;
        };
        return IzendaTileHover;
    }());
    module_definition_30.default.directive('izendaTileHover', ['$window', IzendaTileHover.factory()]);
});
izendaRequire.define("dashboard/components/tile/tile-resizable-directive", ["require", "exports", "angular", "dashboard/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_31) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Directive provides resize function for dashboard tile.
     */
    var IzendaTileResizable = /** @class */ (function () {
        function IzendaTileResizable($izendaDashboardStorageService) {
            var _this = this;
            this.$izendaDashboardStorageService = $izendaDashboardStorageService;
            this.restrict = 'E';
            this.scope = {
                gridWidth: '=',
                gridHeight: '=',
                tile: '=',
                tiles: '=',
                onResize: '&',
                onResizeStart: '&',
                onResizeEnd: '&'
            };
            IzendaTileResizable.prototype.link = function ($scope, $element) {
                // initialize resizable
                var $tile = $element.closest('.iz-dash-tile');
                var $tileFlippies;
                var previousHelperBbox = { left: 0, top: 0, width: 0, height: 0 };
                /**
                 * Check tile intersects to any other tile
                 */
                var checkTileIntersects = function ($helper) {
                    var hitTest = function (a, otherTile, accuracyX, accuracyY) {
                        var aPos = a.position();
                        var aTop = aPos.top > 0 ? aPos.top : 0;
                        var aBottom = aTop + a.height();
                        var aLeft = aPos.left > 0 ? aPos.left : 0;
                        var aRight = aLeft + a.width();
                        if (aRight / $scope.gridWidth > 12) {
                            var delta = aRight - $scope.gridWidth * 12;
                            aLeft -= delta;
                            aRight = $scope.gridWidth * 12;
                        }
                        var bLeft = otherTile.x * $scope.gridWidth + accuracyX;
                        var bTop = otherTile.y * $scope.gridHeight + accuracyY;
                        var bRight = (otherTile.x + otherTile.width) * $scope.gridWidth - accuracyX;
                        var bBottom = (otherTile.y + otherTile.height) * $scope.gridHeight - accuracyY;
                        return !(bLeft > aRight || bRight < aLeft || bTop > aBottom || bBottom < aTop);
                    };
                    var result = false;
                    $scope.tiles.forEach(function (oTile) {
                        if (oTile.id === $scope.tile.id)
                            return;
                        if (hitTest($helper, oTile, $scope.gridWidth / 2, $scope.gridHeight / 2))
                            result = true;
                    });
                    return result;
                };
                /**
                 * Update resizable according to current gridWidth and gridHeight
                 */
                var updateContraints = function () {
                    $tile['resizable']('option', 'grid', [$scope.gridWidth, $scope.gridHeight]);
                    $tile['resizable']('option', 'minHeight', $scope.gridWidth);
                    $tile['resizable']('option', 'minWidth', $scope.gridHeight);
                };
                /**
                 * Update tile x,y,width,height according to the new dom element size
                 */
                var updateTileSize = function (tile, $t) {
                    var tilePosition = $t.position();
                    var x = Math.round(tilePosition.left / $scope.gridWidth);
                    var y = Math.round(tilePosition.top / $scope.gridHeight);
                    var width = Math.round($t.width() / $scope.gridWidth);
                    var height = Math.round($t.height() / $scope.gridHeight);
                    var isTileSizeNeedToCorrect = x < 0 || y < 0 || x + width > 12;
                    if (x < 0) {
                        width = width + x;
                        tile.x = 0;
                    }
                    else
                        tile.x = x;
                    if (y < 0) {
                        height = height + y;
                        tile.y = 0;
                    }
                    else
                        tile.y = y;
                    tile.width = width;
                    tile.height = height;
                    if (tile.x + tile.width > 12) {
                        tile.width = 12 - tile.x;
                    }
                    if (isTileSizeNeedToCorrect) {
                        var l = tile.x * $scope.gridWidth;
                        var t = tile.y * $scope.gridHeight;
                        $t.css('transform', "translate3d(" + l + "px," + t + "px,0)");
                        $t.width(tile.width * $scope.gridWidth);
                        $t.height(tile.height * $scope.gridHeight);
                    }
                };
                // initialize resizable for tile
                $tile['resizable']({
                    minWidth: $scope.gridWidth,
                    minHeight: $scope.gridHeight,
                    grid: [$scope.gridWidth, $scope.gridHeight],
                    handles: 'n, e, s, w, se',
                    // start resize handler
                    start: function (event) {
                        $scope.tiles.forEach(function (t) {
                            t.backTilePopupOpened = false;
                        });
                        // turn off window resize handler
                        _this.$izendaDashboardStorageService.turnOffWindowResizeHandler();
                        // context variables
                        $tile = angular.element(event.target);
                        $tileFlippies = $tile.children('.animate-flip').children('.flippy');
                        $tileFlippies.children('.frame').addClass('hidden');
                        $tileFlippies.removeClass('flipInY');
                        $tileFlippies.css('background-color', 'rgba(50,205,50, 0.3)');
                        $tile.css('z-index', 1000);
                        $tile.css('opacity', 1);
                        // fire onResizeStart handler:
                        if (angular.isFunction($scope.onResizeStart)) {
                            var eventResult = {
                                tile: $scope.tile
                            };
                            $scope.onResizeStart({ eventResult: eventResult });
                        }
                    },
                    // resize handler
                    resize: function () {
                        var helperPosition = $tile.position();
                        var x = Math.round(helperPosition.left / $scope.gridWidth) * $scope.gridWidth;
                        var y = Math.round(helperPosition.top / $scope.gridHeight) * $scope.gridHeight;
                        var helperBbox = {
                            left: x,
                            top: y,
                            width: Math.round($tile.width() / $scope.gridWidth) * $scope.gridWidth,
                            height: Math.round($tile.height() / $scope.gridHeight) * $scope.gridWidth
                        };
                        // prevent duplicate calls
                        if (previousHelperBbox.left === helperBbox.left &&
                            previousHelperBbox.top === helperBbox.top &&
                            previousHelperBbox.width === helperBbox.width &&
                            previousHelperBbox.height === helperBbox.height)
                            return;
                        previousHelperBbox = helperBbox;
                        // fire onMove handler:
                        if (angular.isFunction($scope.onResize)) {
                            var eventResult = {
                                tile: $scope.tile,
                                shadowPosition: helperBbox
                            };
                            $scope.onResize({ eventResult: eventResult });
                        }
                        $tileFlippies.css('background-color', 'rgba(50,205,50, 0.5)');
                        if (checkTileIntersects($tile)) {
                            $tileFlippies.css('background-color', 'rgba(220,20,60,0.5)');
                        }
                    },
                    // end resize handler
                    stop: function (event, ui) {
                        $tile.css('z-index', '1');
                        $tile.find('.frame').removeClass('hidden');
                        $tileFlippies.removeClass('flipInY');
                        $tileFlippies.removeClass('animated');
                        $tileFlippies.removeClass('fast');
                        $tileFlippies.css('background-color', '');
                        var eventResult;
                        if (checkTileIntersects($tile)) {
                            $tile.animate({
                                left: ui.originalPosition.left,
                                top: ui.originalPosition.top,
                                width: ui.originalSize.width,
                                height: ui.originalSize.height
                            }, 200);
                            eventResult = {
                                action: 'resize cancel',
                                isTileSizeChanged: false
                            };
                        }
                        else {
                            var isTileSizeChanged = $tile.width() !== ui.originalSize.width || $tile.height() !== ui.originalSize.height;
                            if (isTileSizeChanged)
                                updateTileSize($scope.tile, $tile);
                            eventResult = {
                                action: 'resize end',
                                isTileSizeChanged: isTileSizeChanged
                            };
                        }
                        $tileFlippies.children('.frame').removeClass('hidden');
                        $tile.css('opacity', 1);
                        // turn on window resize handler
                        _this.$izendaDashboardStorageService.turnOnWindowResizeHandler();
                        // fire onResizeEnd handler:
                        if (angular.isFunction($scope.onResizeEnd)) {
                            $scope.onResizeEnd({
                                eventResult: eventResult
                            });
                        }
                    }
                });
                // handlers
                $scope.$watch('enabled', function (enabled, prevEnabled) {
                    if (enabled === prevEnabled)
                        return;
                    $tile['resizable'](enabled ? 'enable' : 'disable');
                });
                $scope.$watch('gridWidth', function (newVal, oldVal) {
                    if (newVal === oldVal)
                        return;
                    updateContraints();
                });
                $scope.$watch('gridHeight', function (newVal, oldVal) {
                    if (newVal === oldVal)
                        return;
                    updateContraints();
                });
                // destruction method
                $element.on('$destroy', function () { });
            };
        }
        IzendaTileResizable.factory = function () {
            var directive = function ($izendaDashboardStorageService) { return new IzendaTileResizable($izendaDashboardStorageService); };
            directive.$inject = ['$izendaDashboardStorageService'];
            return directive;
        };
        return IzendaTileResizable;
    }());
    module_definition_31.default.directive('izendaTileResizable', ['$izendaDashboardStorageService', IzendaTileResizable.factory()]);
});
izendaRequire.define("dashboard/components/tile-back/tile-back-component", ["require", "exports", "common/core/tools/izenda-component", "dashboard/module-definition", "common/query/services/settings-service", "common/core/services/compatibility-service", "izenda-external-libs"], function (require, exports, izenda_component_8, module_definition_32, settings_service_5, compatibility_service_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Back tile component definition
     */
    var IzendaDashboardTileBackComponent = /** @class */ (function () {
        function IzendaDashboardTileBackComponent($izendaSettingsService, $izendaDashboardSettings, $izendaCompatibilityService) {
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaDashboardSettings = $izendaDashboardSettings;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.showAllInResults = true;
            this.isDesignLinksAllowed = true;
            this.printMode = 'Html2PdfAndHtml';
        }
        IzendaDashboardTileBackComponent.prototype.$onInit = function () {
            this.initializeAdHocSettings();
        };
        ;
        IzendaDashboardTileBackComponent.prototype.topSelected = function (newTop) {
            if (this.onSetTileTop)
                this.onSetTileTop({ top: newTop });
        };
        IzendaDashboardTileBackComponent.prototype.printTile = function () {
            this.fireHandler(this.onPrint);
        };
        IzendaDashboardTileBackComponent.prototype.fireExportToExcel = function () {
            this.fireHandler(this.onExportExcel);
        };
        IzendaDashboardTileBackComponent.prototype.fireReportEditorLink = function () {
            this.fireHandler(this.onGoToEditor);
        };
        IzendaDashboardTileBackComponent.prototype.fireReportViewerLink = function () {
            this.fireHandler(this.onGoToViewer);
        };
        IzendaDashboardTileBackComponent.prototype.reloadTile = function () {
            this.fireHandler(this.onReload);
        };
        IzendaDashboardTileBackComponent.prototype.selectReportPart = function () {
            this.fireHandler(this.onSelectReport);
        };
        //////////////////////////////////////////////////////////////////////
        // rights
        //////////////////////////////////////////////////////////////////////
        IzendaDashboardTileBackComponent.prototype.hasRightLevel = function (requiredLevel) {
            var rights = ['None', 'Locked', 'View Only', 'Read Only', 'Full Access'];
            var currentRightLevel = rights.indexOf(this.tile.maxRights);
            if (currentRightLevel < 0)
                throw 'Unknown right string: ' + this.tile.maxRights;
            return currentRightLevel >= requiredLevel;
        };
        IzendaDashboardTileBackComponent.prototype.hasLockedRightsOrMore = function () {
            return this.hasRightLevel(1);
        };
        IzendaDashboardTileBackComponent.prototype.hasViewOnlyRightsOrMore = function () {
            return this.hasRightLevel(2);
        };
        IzendaDashboardTileBackComponent.prototype.hasReadOnlyRightsOrMore = function () {
            return this.hasRightLevel(3);
        };
        IzendaDashboardTileBackComponent.prototype.hasFullRights = function () {
            return this.hasRightLevel(4);
        };
        /**
         * Is html model enabled in AdHocSettings
         */
        IzendaDashboardTileBackComponent.prototype.isPrintTileVisible = function () {
            return this.printMode === 'Html' || this.printMode === 'Html2PdfAndHtml';
        };
        /**
         * Check if one column view required
         */
        IzendaDashboardTileBackComponent.prototype.isOneColumnView = function () {
            return this.$izendaCompatibilityService.isOneColumnView();
        };
        IzendaDashboardTileBackComponent.prototype.initializeAdHocSettings = function () {
            var settings = this.$izendaSettingsService.getCommonSettings();
            this.isDesignLinksAllowed = settings.showDesignLinks; // show/hide "go to designer" button
            this.showAllInResults = settings.showAllInResults; // show "ALL" in tile top slider
            this.printMode = this.$izendaDashboardSettings.allowedPrintEngine; // allowed print modes
        };
        IzendaDashboardTileBackComponent.prototype.fireHandler = function (handlerFunction) {
            if (handlerFunction)
                handlerFunction({});
        };
        IzendaDashboardTileBackComponent = __decorate([
            izenda_component_8.default(module_definition_32.default, 'izendaDashboardTileBack', ['$izendaSettingsService', '$izendaDashboardSettings', '$izendaCompatibilityService'], {
                templateUrl: '###RS###extres=components.dashboard.components.tile-back.tile-back-template.html',
                bindings: {
                    tile: '<',
                    focused: '<',
                    onSetTileTop: '&',
                    onPrint: '&',
                    onExportExcel: '&',
                    onGoToEditor: '&',
                    onGoToViewer: '&',
                    onReload: '&',
                    onSelectReport: '&'
                }
            }),
            __metadata("design:paramtypes", [settings_service_5.default, Object, compatibility_service_2.default])
        ], IzendaDashboardTileBackComponent);
        return IzendaDashboardTileBackComponent;
    }());
    exports.IzendaDashboardTileBackComponent = IzendaDashboardTileBackComponent;
});
izendaRequire.define("dashboard/components/tile/tile-component", ["require", "exports", "angular", "common/core/tools/izenda-component", "dashboard/module-definition", "common/core/services/compatibility-service", "common/core/services/util-service", "common/query/services/url-service", "common/core/services/util-ui-service", "common/core/services/localization-service", "common/query/services/settings-service", "dashboard/services/dashboard-storage-service", "izenda-external-libs"], function (require, exports, angular, izenda_component_9, module_definition_33, compatibility_service_3, util_service_2, url_service_4, util_ui_service_5, localization_service_7, settings_service_6, dashboard_storage_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Tile default state object
     */
    module_definition_33.default.constant('tileDefaults', {
        id: null,
        canBeLoaded: false,
        maxRights: 'None',
        title: null,
        description: null,
        reportFullName: null,
        reportPartName: null,
        reportSetName: null,
        reportName: null,
        reportCategory: null,
        reportNameWithCategory: null,
        previousReportFullName: null,
        isSourceReportDeleted: false,
        designerType: 'ReportDesigner',
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        top: 100,
        topString: '100',
        flip: false,
        applyFilterParams: false,
        backgroundColor: '#fff',
        backTilePopupOpened: false
    });
    var IzendaDashboardTileComponent = /** @class */ (function () {
        function IzendaDashboardTileComponent(rx, $element, $interval, $timeout, $window, $izendaCompatibilityService, $izendaUtilService, $izendaUrlService, $izendaUtilUiService, $izendaLocaleService, $izendaSettingsService, $izendaDashboardSettings, $izendaDashboardStorageService) {
            this.rx = rx;
            this.$element = $element;
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$window = $window;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.$izendaUtilService = $izendaUtilService;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaDashboardSettings = $izendaDashboardSettings;
            this.$izendaDashboardStorageService = $izendaDashboardStorageService;
            this.deleteConfirmClass = 'title-button hidden-confirm-btn';
            this.tileSizeChanged = false;
            this.isSelectReportPartModalVisible = false;
            this.isDashboardChangingNow = false;
        }
        IzendaDashboardTileComponent.prototype.$onInit = function () {
            var _this = this;
            this.subscriptions = [];
            this.isIe = this.$izendaCompatibilityService.isIe();
            this.isButtonsVisible = true;
            this.deleteConfirmClass = 'title-button hidden-confirm-btn';
            this.tileSizeChanged = false;
            this.state = {
                empty: true,
                resizableHandlerStarted: false,
                relativeReportComplexity: 0
            };
            this.isSelectReportPartModalVisible = false;
            this.exportProgress = null;
            this.previousWidth = this.$window.innerWidth;
            this.subscriptions = [
                this.$izendaDashboardStorageService.refreshObservable.subscribe(function (refreshInfo) { return _this.$onRefresh(refreshInfo); }),
                this.$izendaDashboardStorageService.windowSize.subscribeOnNext(function (newWindowSize) {
                    if (_this.previousWidth === newWindowSize.width)
                        return;
                    _this.previousWidth = newWindowSize.width;
                    _this.refreshTile(false);
                })
            ];
        };
        /**
         * Bindings listener
         */
        IzendaDashboardTileComponent.prototype.$onChanges = function (changesObj) {
            if (changesObj.tile && angular.isObject(changesObj.tile)) {
                this.refreshTile();
            }
            ;
        };
        IzendaDashboardTileComponent.prototype.$onDestroy = function () {
            this.subscriptions.forEach(function (sub) { return sub.dispose(); });
        };
        IzendaDashboardTileComponent.prototype.$onRefresh = function (refreshInfo) {
            var updateFromSource = refreshInfo.updateFromSource;
            var tile = refreshInfo.tile;
            if (!tile || tile === this.tile)
                this.refreshTile(updateFromSource);
        };
        /**
         * Check if tile is empty
         */
        IzendaDashboardTileComponent.prototype.isTileEmpty = function () {
            return this.state.empty;
        };
        /**
         * Check if one column view required
         */
        IzendaDashboardTileComponent.prototype.isOneColumnView = function () {
            return this.$izendaCompatibilityService.isOneColumnView();
        };
        /**
         * Check tile is read only
         */
        IzendaDashboardTileComponent.prototype.isEditAllowed = function () {
            return this.$izendaCompatibilityService.isEditAllowed();
        };
        /**
         * Check if tile title set
         */
        IzendaDashboardTileComponent.prototype.isTitleSet = function () {
            return angular.isString(this.tile.title) && this.tile.title !== '';
        };
        /**
         * Is tile small enough and we need to show buttons without labels.
         */
        IzendaDashboardTileComponent.prototype.isTileButtonsTight = function () {
            return this.tile.width * this.gridWidth < 400;
        };
        /**
         * change report category from cat1\cat2\cat3 to cat1/cat2/cat3
         */
        IzendaDashboardTileComponent.prototype.getConvertedReportCategory = function () {
            return angular.isString(this.tile.reportCategory) ? this.tile.reportCategory : null;
        };
        /**
         * Generate title text
         */
        IzendaDashboardTileComponent.prototype.getTitleText = function () {
            if (this.isTitleSet())
                return this.tile.title;
            var result = '';
            if (this.getConvertedReportCategory())
                result += this.getConvertedReportCategory() + ' / ';
            if (this.tile.reportName && this.tile.reportPartName)
                result += this.tile.reportName + ' / ' + this.tile.reportPartName;
            return result;
        };
        /**
         * Is html model enabled in AdHocSettings
         */
        IzendaDashboardTileComponent.prototype.isReportDivHidden = function () {
            return !this.tile.reportFullName || this.isDashboardChangingNow;
        };
        /**
         * Is tile content should be hidden now.
         */
        IzendaDashboardTileComponent.prototype.isTileSmallEnough = function () {
            return this.tile.width * this.gridWidth < 400 || this.tile.height * this.gridHeight < 400;
        };
        /**
         * Class for confirm delete button (depends on tile size)
         */
        IzendaDashboardTileComponent.prototype.getConfirmDeleteClass = function () {
            var tightClass = this.isTileButtonsTight() ? ' short' : '';
            return "title-button-confirm-remove" + tightClass;
        };
        /**
         * Class for cancel delete button (depends on tile size)
         */
        IzendaDashboardTileComponent.prototype.getCancelDeleteClass = function () {
            var tightClass = this.isTileButtonsTight() ? ' short' : '';
            return "title-button-cancel-remove" + tightClass;
        };
        //////////////////////////////////////////////////////////////////////
        // export modal
        //////////////////////////////////////////////////////////////////////
        IzendaDashboardTileComponent.prototype.getWaitMessageHeaderText = function () {
            if (this.exportProgress === 'export')
                return this.$izendaLocaleService.localeText('js_ExportingInProgress', 'Exporting in progress.');
            if (this.exportProgress === 'print')
                return this.$izendaLocaleService.localeText('js_PrintingInProgress', 'Printing in progress.');
            return '';
        };
        IzendaDashboardTileComponent.prototype.getWaitMessageText = function () {
            if (this.exportProgress === 'export')
                return this.$izendaLocaleService.localeText('js_FinishExporting', 'Please wait till export is completed...');
            if (this.exportProgress === 'print')
                return this.$izendaLocaleService.localeText('js_FinishPrinting', 'Please finish printing before continue.');
            return '';
        };
        //////////////////////////////////////////////////////////////////////
        // tile actions
        //////////////////////////////////////////////////////////////////////
        /**
         * Show confirm delete dialog in title
         */
        IzendaDashboardTileComponent.prototype.showConfirmDelete = function () {
            if (!this.tile.reportFullName) {
                this.deleteTile();
                return;
            }
            this.deleteConfirmClass = 'title-button';
        };
        /**
         * Hide confirm delete dialog in title
         */
        IzendaDashboardTileComponent.prototype.hideConfirmDelete = function () {
            this.deleteConfirmClass = 'title-button hidden-confirm-btn';
        };
        /**
         * Delete this tile
         */
        IzendaDashboardTileComponent.prototype.deleteTile = function () {
            if (angular.isFunction(this.onTileDelete)) {
                this.onTileDelete(this.tile);
            }
        };
        /**
         * Close back tile popup
         */
        IzendaDashboardTileComponent.prototype.closeBackTilePopup = function () {
            this.tile.backTilePopupOpened = false;
        };
        /**
         * Back tile popup closed handler
         */
        IzendaDashboardTileComponent.prototype.onBackTilePopupClosed = function () {
        };
        /**
         * Print tile
         */
        IzendaDashboardTileComponent.prototype.printTile = function () {
            var _this = this;
            this.closeBackTilePopup();
            // print single tile if parameter is set:
            if (!this.tile.reportFullName)
                return;
            this.$izendaDashboardStorageService.printDashboard('html', this.tile.reportFullName).then(function () {
                // HTML print print successfully completed handler
                _this.flipFront(true, false);
            }, function (error) {
                var errorTitle = _this.$izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error');
                var errorText = _this.$izendaLocaleService.localeText('js_FailedPrintReport', 'Failed to print report "{0}". Error description: {1}.');
                errorText = errorText.replaceAll('{0}', _this.model.reportFullName ? _this.model.reportFullName : '');
                errorText = errorText.replaceAll('{1}', error);
                _this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
                console.error(error);
                _this.flipFront(true, false);
            });
        };
        /**
         * Export to excel
         */
        IzendaDashboardTileComponent.prototype.exportExcel = function () {
            var _this = this;
            this.closeBackTilePopup();
            // download the file
            // TODO very easy to add PDF print for tile: 'excel' => 'pdf'
            this.$izendaDashboardStorageService.printDashboard('excel', this.tile.reportFullName).then(function () {
                _this.flipFront(true, false);
            }, function (error) {
                var errorTitle = _this.$izendaLocaleService.localeText('js_FailedExportReportTitle', 'Report export error');
                var errorText = _this.$izendaLocaleService.localeText('js_FailedExportReport', 'Failed to export report "{0}". Error description: {1}.');
                errorText = errorText.replaceAll('{0}', _this.model.reportFullName ? _this.model.reportFullName : '');
                errorText = errorText.replaceAll('{1}', error);
                _this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
                console.error(error);
                _this.flipFront(true, false);
            });
        };
        /**
         * Back tile side click handler
         */
        IzendaDashboardTileComponent.prototype.onBackTileClick = function () {
            var _this = this;
            this.tiles.forEach(function (tile) {
                if (tile.id !== _this.tile.id)
                    tile.backTilePopupOpened = false;
            });
            if (this.isTileSmallEnough()) {
                this.tile.backTilePopupOpened = !this.tile.backTilePopupOpened;
            }
            else {
                this.flipBack();
            }
        };
        /**
         * Flip tile back
         */
        IzendaDashboardTileComponent.prototype.flipBack = function () {
            this.tile.flip = {
                isFront: false
            };
        };
        /**
         * Flip tile front
         */
        IzendaDashboardTileComponent.prototype.flipFront = function (update, updateFromSourceReport) {
            this.closeBackTilePopup();
            this.tile.flip = {
                isFront: true,
                update: update,
                updateFromSourceReport: updateFromSourceReport
            };
        };
        /**
         * Go to report viewer
         */
        IzendaDashboardTileComponent.prototype.fireReportViewerLink = function () {
            this.closeBackTilePopup();
            if (!this.tile.isSourceReportDeleted) {
                this.$window.open(this.getReportViewerLink(), '_blank');
            }
            else {
                var errorText = this.$izendaLocaleService.localeText('js_SourceReportNotExist', 'Source report "{0}" doesn\'t exist.');
                errorText = errorText.replace(new RegExp(/\{0\}/g), this.getSourceReportName());
                this.$izendaUtilUiService.showErrorDialog(errorText);
            }
        };
        /**
         * Go to report editor
         */
        IzendaDashboardTileComponent.prototype.fireReportEditorLink = function () {
            this.closeBackTilePopup();
            if (!this.tile.isSourceReportDeleted) {
                this.$window.open(this.getReportEditorLink(), '_blank');
            }
            else {
                var errorText = this.$izendaLocaleService.localeText('js_SourceReportNotExist', 'Source report "{0}" not exist.');
                errorText = errorText.replace(new RegExp(/\{0\}/g), this.getSourceReportName());
                this.$izendaUtilUiService.showErrorDialog(errorText);
            }
        };
        /**
         * Refresh tile content
         * @param {boolean} updateFromSourceReport. Is tile content need to be refreshed from the source report.
         * TODO: remove DOM manipulations to separate directive.
         */
        IzendaDashboardTileComponent.prototype.refreshTile = function (updateFromSourceReport) {
            // TODO: do we need this variable?
            //const updateFromSource = this.tile.updateFromSource || updateFromSourceReport;
            var _this = this;
            this.tileSizeChanged = false; // reset tile size information
            this.tile.updateFromSource = false; // reset update from source flag
            if (!this.tile.reportFullName)
                return;
            this.tile.previousReportFullName = null;
            // set loading html
            var loadingHtml = "<div class=\"izenda-common-vcentered-container\">\n\t<div class=\"izenda-common-vcentered-item\">\n\t\t<img class=\"izenda-common-img-loading\" src=\"" + this.$izendaUrlService.settings.urlRpPage + "image=ModernImages.loading-grid.gif\" alt=\"Loading...\" />\n\t</div>\n</div>";
            var $body = this.$element.find('.animate-flip> .flippy-front> .frame> .report');
            $body.html(loadingHtml);
            // calculate tile width and height in pixels
            var tileWidth = this.getWidth() * this.gridWidth - 20;
            var tileHeight = this.getHeight() * this.gridHeight - 55;
            if (this.tile.description)
                tileHeight -= 32;
            var size = {
                height: tileHeight,
                width: tileWidth
            };
            // load preview
            this.$izendaDashboardStorageService.loadTilesPreview(this.tile, size).then(function (tilesHtml) {
                _this.applyTileHtml(tilesHtml);
            }, function (error) {
                _this.applyTileHtml(error);
            });
        };
        /**
         * Set tile top values.
         */
        IzendaDashboardTileComponent.prototype.setTileTop = function (newTop) {
            this.tile.top = newTop;
            this.tile.topString = '' + newTop;
        };
        //////////////////////////////////////////////////////////////////////
        // tile handlers
        //////////////////////////////////////////////////////////////////////
        /**
         * Resize start handler
         */
        IzendaDashboardTileComponent.prototype.onTileResizeStartInner = function (eventResult) {
            this.isButtonsVisible = false;
            if (angular.isFunction(this.onTileResizeStart))
                this.onTileResizeStart(eventResult);
        };
        /**
         * Resize handler
         */
        IzendaDashboardTileComponent.prototype.onTileResizeInner = function (eventResult) {
            if (angular.isFunction(this.onTileResize))
                this.onTileResize(eventResult);
        };
        /**
         * Resize end handler
         */
        IzendaDashboardTileComponent.prototype.onTileResizeEndInner = function (eventResult) {
            if (eventResult.isTileSizeChanged) {
                this.flipFront();
                this.refreshTile(false);
            }
            if (angular.isFunction(this.onTileResizeEnd)) {
                this.onTileResizeEnd(eventResult);
            }
            this.isButtonsVisible = true;
        };
        /**
         * Drag end handler
         */
        IzendaDashboardTileComponent.prototype.onTileDragEndInner = function (eventResult) {
            var resultType = eventResult.type; // 'swap', 'move' or 'none'
            if (resultType === 'swap' && eventResult.targetTile && eventResult.isTileSizeChanged) {
                // we have to notify another tile about swap
                this.$izendaDashboardStorageService.refreshDashboard(false, false, eventResult.targetTile);
            }
            if (eventResult.isTileSizeChanged)
                this.refreshTile(false);
            if (angular.isFunction(this.onTileDragEnd))
                this.onTileDragEnd(eventResult);
        };
        /**
         * Select report part for tile
         */
        IzendaDashboardTileComponent.prototype.selectReportPart = function () {
            this.isSelectReportPartModalVisible = true;
        };
        /**
         * Select report part cancelled
         */
        IzendaDashboardTileComponent.prototype.onSelectReportModalClosed = function () {
            // we need to reset "opened" binding.
            this.isSelectReportPartModalVisible = false;
        };
        /**
         * Report part selected handler
         */
        IzendaDashboardTileComponent.prototype.onSelectReportPart = function (reportPartInfo) {
            var _this = this;
            // hide select report part dialog
            this.closeBackTilePopup();
            var rpInfo = reportPartInfo;
            if (rpInfo.UsesHiddenColumns) {
                this.$izendaUtilUiService.showMessageDialog(this.$izendaLocaleService.localeText('js_cannotAddReportWithHiddenColumnsToTile', 'You cannot add this report into the dashboard because it contains hidden columns. Please re-save the original report as a report with a different name or chose another one.'));
                return;
            }
            var fName = rpInfo.Name;
            if (!this.$izendaUtilService.isUncategorized(rpInfo.Category))
                fName = rpInfo.Category + this.$izendaSettingsService.getCategoryCharacter() + fName;
            var nameparts = rpInfo.Name.split('@');
            var name = nameparts[0];
            var part = nameparts[1];
            // check if tile already exist
            var isTileInDashboard = this.tiles.filter(function (tile) {
                return tile.reportPartName === part &&
                    tile.reportName === name &&
                    ((tile.reportCategory === rpInfo.Category) ||
                        (_this.$izendaUtilService.isUncategorized(tile.reportCategory) && _this.$izendaUtilService.isUncategorized(rpInfo.Category)));
            }).length > 0;
            if (isTileInDashboard) {
                var errorText = this.$izendaLocaleService.localeText('js_CantSelectReportPart', 'Can\'t select report part because dashboard already contains tile with that report.');
                this.$izendaUtilUiService.showNotification(errorText);
                return;
            }
            // update report parameters
            this.tile.previousReportFullName = this.tile.reportFullName;
            angular.extend(this.tile, this.$izendaUrlService.extractReportPartNames(fName, true));
            this.tile.title = rpInfo.Title;
            // update report name with category variable
            this.tile.reportNameWithCategory = this.tile.reportName;
            if (!this.$izendaUtilService.isUncategorized(this.tile.reportCategory))
                this.tile.reportNameWithCategory = this.tile.reportCategory +
                    this.$izendaSettingsService.getCategoryCharacter() +
                    this.tile.reportNameWithCategory;
            if (rpInfo.IsLocked)
                this.tile.maxRights = 'Locked';
            else if (rpInfo.ViewOnly)
                this.tile.maxRights = 'View Only';
            else if (rpInfo.ReadOnly)
                this.tile.maxRights = 'Read Only';
            else
                this.tile.maxRights = 'Full Access';
            // set top variables for tile:
            var newTop = rpInfo.NativeTop && rpInfo.NativeTop > 0 ? rpInfo.NativeTop : 100;
            this.setTileTop(newTop);
            this.tile.designerType = rpInfo.DesignerType;
            this.flipFront(true, true);
            if (angular.isFunction(this.onTileReportSelected)) {
                this.onTileReportSelected(this.tile);
            }
        };
        /**
         * Tile flip handler
         */
        IzendaDashboardTileComponent.prototype.onTileFlip = function (isFront, update, updateFromSourceReport) {
            if (isFront && update) {
                this.refreshTile(updateFromSourceReport);
            }
        };
        /**
         * Tile top changed:
         */
        IzendaDashboardTileComponent.prototype.onSetTileTop = function (top) {
            if (this.tile.top === top)
                return;
            this.tile.top = top;
            this.tile.topString = '' + top;
            this.flipFront(true, false);
            this.closeBackTilePopup();
        };
        //////////////////////////////////////////////////////////////////////
        // tile position
        //////////////////////////////////////////////////////////////////////
        /**
         * Return style object for '.iz-dash-tile'
         */
        IzendaDashboardTileComponent.prototype.getTileStyle = function () {
            var top = this.gridHeight * this.getY();
            var left = this.gridWidth * this.getX();
            var result = {
                'width': (this.gridWidth * this.getWidth()) + 'px',
                'height': (this.gridHeight * this.getHeight()) + 'px',
                'z-index': (this.tile.backTilePopupOpened ? '3' : '1')
            };
            if (this.$izendaCompatibilityService.isLteIe10()) {
                result['x'] = left + "px";
                result['y'] = top + "px";
            }
            else {
                result['transform'] = "translate3d(" + left + "px," + top + "px,0)";
            }
            return result;
        };
        /**
         * Get tile width
         */
        IzendaDashboardTileComponent.prototype.getWidth = function () {
            return this.isOneColumnView() ? 12 : this.tile.width;
        };
        /**
         * Get tile height
         */
        IzendaDashboardTileComponent.prototype.getHeight = function () {
            return this.isOneColumnView() ? 4 : this.tile.height;
        };
        /**
         * Get X coordinate for tile. This coordinate used for drawing tile UI
         */
        IzendaDashboardTileComponent.prototype.getX = function () {
            return this.isOneColumnView() ? 0 : this.tile.x;
        };
        /**
         * Get Y coordinate for tile. This coordinate used for drawing tile UI
         */
        IzendaDashboardTileComponent.prototype.getY = function () {
            return this.isOneColumnView() ? 4 * this.tile.getTileOrder(this.tiles) : this.tile.y;
        };
        /**
         * Get report viewer link for tile report
         */
        IzendaDashboardTileComponent.prototype.getReportViewerLink = function () {
            return getAppendedUrl(this.$izendaUrlService.settings.urlReportViewer + "?rn=" + this.getSourceReportName());
        };
        /**
         * Get report editor link for tile report
         */
        IzendaDashboardTileComponent.prototype.getReportEditorLink = function () {
            var designerUrl = this.tile.designerType === 'InstantReport'
                ? this.$izendaUrlService.settings.urlInstantReport
                : this.$izendaUrlService.settings.urlReportDesigner;
            return getAppendedUrl(designerUrl + "?rn=" + this.getSourceReportName());
        };
        /**
         * Get source report name
         */
        IzendaDashboardTileComponent.prototype.getSourceReportName = function () {
            var result = this.tile.reportName;
            if (!this.$izendaUtilService.isUncategorized(this.tile.reportCategory))
                result = this.tile.reportCategory + this.$izendaSettingsService.getCategoryCharacter() + result;
            return result;
        };
        /**
         * Set tile inner html
         */
        IzendaDashboardTileComponent.prototype.applyTileHtml = function (htmlData) {
            // load tile content
            var $report = angular.element(this.$element).find('.report');
            this.$izendaDashboardStorageService.loadReportIntoContainer(htmlData, $report);
            var numberOfCellInComplexReport = 3000;
            var numberOfCells = angular.element(this.$element).find('.ReportTable td').length;
            this.state.relativeReportComplexity = numberOfCells / numberOfCellInComplexReport;
            if (this.state.relativeReportComplexity > 1)
                this.state.relativeReportComplexity = 1;
            if (this.isIe && this.state.relativeReportComplexity >= 0.5)
                this.$element.addClass('hover-ie');
            this.state.empty = false;
        };
        IzendaDashboardTileComponent = __decorate([
            izenda_component_9.default(module_definition_33.default, 'izendaDashboardTile', ['rx', '$element', '$interval', '$timeout', '$window', '$izendaCompatibilityService', '$izendaUtilService', '$izendaUrlService',
                '$izendaUtilUiService', '$izendaLocaleService', '$izendaSettingsService', '$izendaDashboardSettings', '$izendaDashboardStorageService'], {
                templateUrl: '###RS###extres=components.dashboard.components.tile.tile-template.html',
                bindings: {
                    tile: '<',
                    tiles: '<',
                    gridWidth: '<',
                    gridHeight: '<',
                    isDashboardChangingNow: '<',
                    onTileDrag: '&',
                    onTileDragStart: '&',
                    onTileDragEnd: '&',
                    onTileResize: '&',
                    onTileResizeStart: '&',
                    onTileResizeEnd: '&',
                    onTileDelete: '&',
                    onTileReportSelected: '&'
                }
            }),
            __metadata("design:paramtypes", [Object, Object, Function, Function, Object, compatibility_service_3.default,
                util_service_2.default,
                url_service_4.default,
                util_ui_service_5.default,
                localization_service_7.default,
                settings_service_6.default, Object, dashboard_storage_service_1.default])
        ], IzendaDashboardTileComponent);
        return IzendaDashboardTileComponent;
    }());
});
izendaRequire.define("dashboard/components/filter/filter-component", ["require", "exports", "common/core/tools/izenda-component", "dashboard/module-definition", "common/query/services/url-service", "dashboard/services/dashboard-storage-service", "izenda-external-libs"], function (require, exports, izenda_component_10, module_definition_34, url_service_5, dashboard_storage_service_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * <izenda-dashboard-filters> component
     */
    var IzendaDashboardFiltersComponent = /** @class */ (function () {
        function IzendaDashboardFiltersComponent($rx, $window, $timeout, $element, $izendaUrlService, $izendaDashboardStorageService) {
            this.$rx = $rx;
            this.$window = $window;
            this.$timeout = $timeout;
            this.$element = $element;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaDashboardStorageService = $izendaDashboardStorageService;
            this.$window.useGetRenderedReportSetForFilters = false;
            this.isFiltersActive = this.$izendaDashboardStorageService.isFiltersActive.getValue();
            // subscribe
            this.subscriptions = [
                this.$izendaDashboardStorageService.isFiltersActive.subscribeOnNext(this.$onFiltersActiveChange, this)
            ];
        }
        IzendaDashboardFiltersComponent.prototype.$onInit = function () {
            IzLocal.LocalizePage();
            this.setRefreshButtonHandler();
        };
        IzendaDashboardFiltersComponent.prototype.$onDestroy = function () {
            this.subscriptions.forEach(function (sub) { return sub.dispose(); });
        };
        /**
         * Filters panel on/off handler
         * @param {boolean} isFiltersActive new panel state.
         */
        IzendaDashboardFiltersComponent.prototype.$onFiltersActiveChange = function (isFiltersActive) {
            this.isFiltersActive = isFiltersActive;
        };
        /**
         * Add "update" button handler
         */
        IzendaDashboardFiltersComponent.prototype.setRefreshButtonHandler = function () {
            var _this = this;
            var $btn = this.$element.find('.filters-legacy-update-btn');
            if (!$btn.length)
                return;
            var clicks = this.$rx.Observable.fromEvent($btn.get(0), 'click');
            var clicksThrottle = clicks.debounce(500);
            // do merge to ensure that the handlers order will be correct
            this.$rx.Observable.merge(clicks.map(function (e) { return ({ event: e, isThrottleApplied: false }); }), clicksThrottle.map(function (e) { return ({ event: e, isThrottleApplied: true }); }))
                .subscribe(function (obj) {
                obj.event.preventDefault();
                var isThrottleApplied = obj.isThrottleApplied;
                if (!isThrottleApplied) {
                    // fast clicks handler (always runs before the handler with the enabled throttle condition)
                    $btn.children('a').removeClass('blue');
                    $btn.children('a').addClass('gray');
                    _this.$izendaDashboardStorageService.cancelRefreshDashboardQueries();
                }
                else {
                    // run refresh when throttling is done.
                    $btn.children('a').removeClass('gray');
                    $btn.children('a').addClass('blue');
                    _this.$timeout(function () {
                        _this.$izendaDashboardStorageService.refreshDashboard(false, false);
                    }, 100);
                }
            });
        };
        IzendaDashboardFiltersComponent = __decorate([
            izenda_component_10.default(module_definition_34.default, 'izendaDashboardFilters', ['rx', '$window', '$timeout', '$element', '$izendaUrlService', '$izendaDashboardStorageService'], {
                templateUrl: '###RS###extres=components.dashboard.components.filter.filter-template.html',
                bindings: {}
            }),
            __metadata("design:paramtypes", [Object, Object, Function, Object, url_service_5.default,
                dashboard_storage_service_2.default])
        ], IzendaDashboardFiltersComponent);
        return IzendaDashboardFiltersComponent;
    }());
    exports.IzendaDashboardFiltersComponent = IzendaDashboardFiltersComponent;
});
izendaRequire.define("dashboard/components/gallery/gallery-component", ["require", "exports", "angular", "common/core/tools/izenda-component", "dashboard/module-definition", "common/query/services/url-service", "dashboard/services/dashboard-storage-service", "dashboard/services/background-service", "izenda-external-libs"], function (require, exports, angular, izenda_component_11, module_definition_35, url_service_6, dashboard_storage_service_3, background_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * <izenda-gallery> component
     */
    var IzendaGalleryComponent = /** @class */ (function () {
        function IzendaGalleryComponent($rx, $scope, $window, $element, $interval, $timeout, $izendaUrlService, $izendaDashboardStorageService, $izendaBackgroundService) {
            this.$rx = $rx;
            this.$scope = $scope;
            this.$window = $window;
            this.$element = $element;
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaDashboardStorageService = $izendaDashboardStorageService;
            this.$izendaBackgroundService = $izendaBackgroundService;
            this.subscriptions = [];
            this.subscriptions = [];
            this.$parentElement = this.$element.parent();
            if (!this.$element.hasClass('izenda-gallery-container'))
                this.$element.addClass('izenda-gallery-container');
            this.$smallButtonsPanel = this.$parentElement.find('.izenda-gallery-controls-round-panel');
            this.$titlePanel = this.$parentElement.find('.izenda-gallery-title-controls');
            this.currentTile = null;
            this.state = {
                isUiHidden: false,
                width: 0,
                height: 0,
                elementHeight: this.$parentElement.height(),
                smallButtonsPanelHeight: this.$smallButtonsPanel.height(),
                titlePanelPosition: this.$titlePanel.position(),
                titlePanelHeight: this.$titlePanel.height()
            };
            this.setFullscreenHandlers();
        }
        IzendaGalleryComponent.prototype.$onInit = function () {
            var _this = this;
            this.previousWidth = this.$window.innerWidth;
            this.subscriptions = [
                this.$izendaDashboardStorageService.windowSize.subscribeOnNext(function (newWindowSize) {
                    if (_this.previousWidth === newWindowSize.width || !_this.enabled)
                        return;
                    _this.previousWidth = newWindowSize.width;
                    _this.$onWindowResize();
                }, this)
            ];
        };
        IzendaGalleryComponent.prototype.$onChanges = function (changesObject) {
            if (changesObject.enabled) {
                var isEnabled = changesObject.enabled.currentValue;
                if (isEnabled)
                    this.activateGallery();
                else
                    this.deactivateGallery();
            }
            else if (changesObject.playStarted) {
                var isStarted = changesObject.playStarted.currentValue;
                if (isStarted)
                    this.play();
                else
                    this.stop();
            }
            else if (changesObject.isFullScreen) {
                var isFullscreen = changesObject.isFullScreen.currentValue;
                this.toggleFullscreen(isFullscreen);
            }
        };
        IzendaGalleryComponent.prototype.$onDestroy = function () {
            this.removeFullscreenHandlers();
            this.subscriptions.forEach(function (sub) { return sub.dispose(); });
        };
        /**
         * On fullscreen change handler
         */
        IzendaGalleryComponent.prototype.$onfullscreenchange = function () {
            if (!this.enabled)
                return;
            var isFullscreen = !!(document['fullscreenElement'] || document['webkitFullscreenElement'] || document['mozFullScreenElement'] || document['msFullscreenElement']);
            if (this.isFullScreen !== isFullscreen && angular.isFunction(this.onFullscreenChange)) {
                this.onFullscreenChange({ isFullscreen: isFullscreen });
            }
        };
        /**
         * Gallery
         */
        IzendaGalleryComponent.prototype.$onWindowResize = function () {
            var _this = this;
            if (!this.enabled)
                return;
            this.toggleTileAnimations(false);
            this.initSizes();
            this.$timeout(function () {
                _this.loadTilesToGallery();
                _this.toggleTileAnimations(true);
            }, 1, true);
        };
        IzendaGalleryComponent.prototype.enableKeyHandlers = function () {
            var _this = this;
            // hotkeys handler
            angular.element('body').on('keydown.izendaGallery', function (e) {
                if (!_this.enabled)
                    return;
                var keyCode = e.keyCode;
                _this.$scope.$apply(function () {
                    if (!_this.enabled)
                        return;
                    if (e.keyCode === 37 /* ArrowLeft */) {
                        _this.goPrevious();
                    }
                    else if (keyCode === 39 /* ArrowRight */ || keyCode === 32 /* Space */) {
                        _this.goNext();
                    }
                });
            });
        };
        IzendaGalleryComponent.prototype.disableKeyHandlers = function () {
            angular.element('body').off('keydown.izendaGallery');
        };
        IzendaGalleryComponent.prototype.setFullscreenHandlers = function () {
            var fullscreenRootElement = this.$parentElement.get(0);
            this.fullscreenHandler = this.$onfullscreenchange.bind(this);
            fullscreenRootElement.addEventListener('webkitfullscreenchange', this.fullscreenHandler);
            fullscreenRootElement.addEventListener('fullscreenchange', this.fullscreenHandler);
            document.addEventListener('fullscreenchange', this.fullscreenHandler);
            document.addEventListener('mozfullscreenchange', this.fullscreenHandler);
            document.addEventListener('MSFullscreenChange', this.fullscreenHandler);
        };
        IzendaGalleryComponent.prototype.removeFullscreenHandlers = function () {
            var fullscreenRootElement = this.$parentElement.get(0);
            fullscreenRootElement.removeEventListener('webkitfullscreenchange', this.fullscreenHandler);
            fullscreenRootElement.removeEventListener('fullscreenchange', this.fullscreenHandler);
            document.removeEventListener('fullscreenchange', this.fullscreenHandler);
            document.removeEventListener('mozfullscreenchange', this.fullscreenHandler);
            document.removeEventListener('MSFullscreenChange', this.fullscreenHandler);
        };
        IzendaGalleryComponent.prototype.updateGalleryBackground = function (isFullScreen) {
            var $galleryContainer = this.$parentElement;
            // when we're going to fullscreen mode - we need to add background for element, which will be the root in fullscreen view.
            if (isFullScreen) {
                var backgroundImg = this.$izendaBackgroundService.finalBackgroundImageUrl;
                $galleryContainer.css('background-image', backgroundImg ? "url(\"" + backgroundImg + "\")" : '');
                var backgroundColor = this.$izendaBackgroundService.backgroundColor;
                $galleryContainer.css('background-color', backgroundColor);
            }
            else {
                $galleryContainer.css('background-image', '');
                $galleryContainer.css('background-color', '');
            }
        };
        IzendaGalleryComponent.prototype.toggleFullscreen = function (isFullscreen) {
            var launchFullScreen = function (element) {
                if (element.requestFullscreen)
                    element.requestFullscreen();
                else if (element.mozRequestFullScreen)
                    element.mozRequestFullScreen();
                else if (element.webkitRequestFullScreen)
                    element.webkitRequestFullScreen();
                else if (element.msRequestFullscreen)
                    element.msRequestFullscreen();
            };
            var cancelFullscreen = function () {
                if (document['exitFullscreen'])
                    document['exitFullscreen']();
                else if (document['mozCancelFullScreen'])
                    document['mozCancelFullScreen']();
                else if (document['webkitCancelFullScreen'])
                    document['webkitCancelFullScreen']();
                else if (document['msExitFullscreen'])
                    document['msExitFullscreen']();
            };
            this.updateGalleryBackground(isFullscreen);
            if (isFullscreen) {
                var fullscreenRootElement = this.$parentElement.get(0);
                launchFullScreen(fullscreenRootElement);
            }
            else
                cancelFullscreen();
        };
        /**
         * Gallery enabled handler
         */
        IzendaGalleryComponent.prototype.activateGallery = function () {
            var _this = this;
            this.state.isUiHidden = false;
            this.currentTile = null;
            if (this.model && this.galleryTiles.length)
                this.currentTile = this.galleryTiles[0];
            this.initSizes();
            this.enableKeyHandlers();
            this.$element.find('.izenda-gallery-item').css('opacity', 1);
            this.$timeout(function () {
                _this.toggleTileAnimations(true);
                _this.loadTilesToGallery();
            }, 250, true);
        };
        /**
         * Gallery disabled handler
         */
        IzendaGalleryComponent.prototype.deactivateGallery = function () {
            this.clearTiles();
            this.state.isUiHidden = false;
            this.currentTile = null;
            this.disableKeyHandlers();
            this.toggleTileAnimations(false);
            this.$element.find('.izenda-gallery-item').css('opacity', 0);
        };
        /**
         * Start rotating gallery tiles.
         */
        IzendaGalleryComponent.prototype.play = function () {
            var _this = this;
            this.stop();
            if (this.galleryTiles.length <= 1)
                return;
            if (this.playStopOnComplete && this.galleryTiles.indexOf(this.currentTile) === this.galleryTiles.length - 1)
                this.goTo(this.galleryTiles[0]);
            this.state.updatePlayIntervalId = this.$interval(function () {
                if (_this.playStopOnComplete && _this.galleryTiles.indexOf(_this.currentTile) === _this.galleryTiles.length - 1) {
                    _this.playStarted = false;
                    _this.stop();
                    _this.runStopHandler();
                }
                else {
                    _this.goNext();
                }
            }, this.playTimeout);
            this.state.updatePlayTimeoutId = this.$timeout(function () {
                _this.state.isUiHidden = true;
            }, 1);
        };
        /**
         * Stop rotating gallery tiles.
         */
        IzendaGalleryComponent.prototype.stop = function () {
            if (this.state.updatePlayIntervalId) {
                this.$interval.cancel(this.state.updatePlayIntervalId);
                this.state.updatePlayIntervalId = null;
            }
            if (this.state.updatePlayTimeoutId != null) {
                this.$timeout.cancel(this.state.updatePlayTimeoutId);
                this.state.updatePlayTimeoutId = null;
                this.state.isUiHidden = false;
            }
        };
        IzendaGalleryComponent.prototype.runStopHandler = function () {
            if (angular.isFunction(this.onPlayStartedChange)) {
                this.onPlayStartedChange({ isPlayStarted: this.playStarted });
            }
        };
        /**
         * Show selected tile
         * @param {IzendaDashboardTileModel} tile tile model.
         */
        IzendaGalleryComponent.prototype.goTo = function (tile) {
            this.currentTile = tile;
        };
        /**
         * Show previous tile
         */
        IzendaGalleryComponent.prototype.goPrevious = function () {
            if (this.galleryTiles.length < 2)
                return;
            var index = this.currentTile ? this.galleryTiles.indexOf(this.currentTile) : 0;
            index--;
            if (index < 0)
                index = this.galleryTiles.length - 1;
            this.goTo(this.galleryTiles[index]);
        };
        /**
         * Show next tile.
         */
        IzendaGalleryComponent.prototype.goNext = function () {
            if (this.galleryTiles.length < 2)
                return;
            var index = this.currentTile ? this.galleryTiles.indexOf(this.currentTile) : 0;
            index++;
            if (index > this.galleryTiles.length - 1)
                index = 0;
            this.goTo(this.galleryTiles[index]);
        };
        /**
         * Initialize basic sizes
         */
        IzendaGalleryComponent.prototype.initSizes = function () {
            var tileContainerTop = angular.element('.iz-dash-root').offset().top;
            var fullHeight = angular.element(this.$window).height() - tileContainerTop - 30;
            this.$parentElement.height(fullHeight);
            this.state.width = this.$parentElement.width();
            this.state.height = this.$parentElement.height();
            this.state.elementHeight = this.$parentElement.height();
            this.state.smallButtonsPanelHeight = this.$smallButtonsPanel.height(); // cache sizes
            this.state.titlePanelPosition = this.$titlePanel.position();
            this.state.titlePanelHeight = this.$titlePanel.height();
            var tileSize = this.currentTile
                ? this.getTileSize(this.currentTile)
                : {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    delta: 0
                };
            this.$smallButtonsPanel.css('top', tileSize.y + tileSize.height + 'px');
        };
        Object.defineProperty(IzendaGalleryComponent.prototype, "galleryTiles", {
            /**
             * Gallery tiles getter - tiles available for showing in gallery.
             */
            get: function () {
                if (!this.model || !this.model.tiles.length)
                    return [];
                return this.model.tilesSorted.filter(function (t) { return !!t.reportName; });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaGalleryComponent.prototype, "tileTitle", {
            /**
             * Create title for the tile
             */
            get: function () {
                if (!this.currentTile)
                    return '';
                if (this.currentTile.title)
                    return this.currentTile.title;
                var result = '';
                if (this.currentTile.reportCategory)
                    result = this.currentTile.reportCategory + ' / ';
                result = result + this.currentTile.reportName + ' / ' + this.currentTile.reportPartName;
                return result;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Get tile CSS style.
         * @param {IzendaDashboardTileModel} tile tile model instance.
         */
        IzendaGalleryComponent.prototype.getTileStyle = function (tile) {
            var size = this.getTileSize(tile);
            var style = {
                'transform': "translate(" + size.x + "px, " + size.y + "px)",
                'width': size.width + "px",
                'height': size.height + "px",
                'opacity': size.delta ? '0.5' : '1'
            };
            return style;
        };
        /**
         * Calculate tile size.
         * @param {IzendaDashboardTileModel} tile tile model instance.
         */
        IzendaGalleryComponent.prototype.getTileSize = function (tile) {
            var tileIndex = this.galleryTiles.indexOf(tile);
            var currentTileIndex = this.galleryTiles.indexOf(this.currentTile);
            var parsedWidth = this.parseSize(this.width);
            var parsedHeight = this.parseSize(this.height);
            var galleryItemWidth = Math.round(parsedWidth.isPercent ? this.state.width * parsedWidth.value : parsedWidth.value);
            var galleryItemHeight = Math.round(parsedHeight.isPercent ? this.state.height * parsedHeight.value : parsedHeight.value);
            var spaceWidth = 100;
            var delta = tileIndex - currentTileIndex;
            var transformX = Math.round((this.state.width - galleryItemWidth) / 2 + delta * (galleryItemWidth + spaceWidth));
            var transformY = Math.round((this.state.height - galleryItemHeight) / 2);
            var constraintBottom = this.state.smallButtonsPanelHeight;
            var constraintTop = this.state.titlePanelPosition.top + this.state.titlePanelHeight + 10;
            if (transformY < constraintTop)
                transformY = constraintTop;
            if (transformY + galleryItemHeight > this.state.elementHeight - constraintBottom) {
                galleryItemHeight = this.state.elementHeight - transformY - constraintBottom;
            }
            return {
                x: transformX,
                y: transformY,
                width: galleryItemWidth,
                height: galleryItemHeight,
                delta: delta
            };
        };
        /**
         * Parse size string
         * @param {string} sizeString
         */
        IzendaGalleryComponent.prototype.parseSize = function (sizeString) {
            var result = {
                isPercent: false,
                value: 0
            };
            if (sizeString.endsWith('%')) {
                result.isPercent = true;
                result.value = parseInt(sizeString.substring(0, sizeString.length - 1)) / 100;
            }
            else if (sizeString.endsWith('px'))
                result.value = parseInt(sizeString.substring(0, sizeString.length - 2));
            else
                result.value = parseInt(sizeString);
            return result;
        };
        /**
         * Turn on/off CSS tile animations
         * @param {bool} enabled
         */
        IzendaGalleryComponent.prototype.toggleTileAnimations = function (enabled) {
            if (enabled) {
                this.$element.find('.izenda-gallery-item').addClass('izenda-gallery-transition');
            }
            else {
                this.$element.find('.izenda-gallery-item').removeClass('izenda-gallery-transition');
            }
        };
        /**
         * Clear tiles.
         */
        IzendaGalleryComponent.prototype.clearTiles = function () {
            var _this = this;
            this.galleryTiles.forEach(function (tile) {
                var $tile = _this.$element.find(".izenda-gallery-item[tile-id=" + tile.id + "] > .izenda-gallery-item-inner");
                $tile.empty();
            });
        };
        /**
        * Load gallery tile
        */
        IzendaGalleryComponent.prototype.loadTilesToGallery = function () {
            var _this = this;
            this.galleryTiles.forEach(function (tile) {
                var $tile = _this.$element.find(".izenda-gallery-item[tile-id=" + tile.id + "] > .izenda-gallery-item-inner");
                var loadingHtml = '<div class="izenda-common-vcentered-container">' +
                    '<div class="izenda-common-vcentered-item">' +
                    '<img class="izenda-common-img-loading" src="' +
                    _this.$izendaUrlService.settings.urlRpPage +
                    'image=ModernImages.loading-grid.gif" alt="Loading..." />' +
                    '</div>' +
                    '</div>';
                $tile.html(loadingHtml);
                var size = {
                    height: $tile.height(),
                    width: $tile.width()
                };
                _this.$izendaDashboardStorageService.loadTilesPreview(tile, size).then(function (tilesHtml) {
                    var $reportDiv = angular.element('<div class="report"></div>');
                    $tile.empty();
                    $tile.append($reportDiv);
                    // load html into this div
                    _this.$izendaDashboardStorageService.loadReportIntoContainer(tilesHtml, $reportDiv);
                }, function (error) {
                    $tile.empty();
                    $tile.text(error);
                });
            });
        };
        IzendaGalleryComponent = __decorate([
            izenda_component_11.default(module_definition_35.default, 'izendaGallery', ['rx', '$scope', '$window', '$element', '$interval', '$timeout', '$izendaUrlService', '$izendaDashboardStorageService', '$izendaBackgroundService'], {
                templateUrl: '###RS###extres=components.dashboard.components.gallery.gallery-template.html',
                bindings: {
                    model: '<',
                    width: '@',
                    height: '@',
                    playTimeout: '<',
                    playStarted: '<',
                    playStopOnComplete: '<',
                    isFullScreen: '<',
                    enabled: '<',
                    onPlayStartedChange: '&',
                    onFullscreenChange: '&'
                }
            }),
            __metadata("design:paramtypes", [Object, Object, Object, Object, Function, Function, url_service_6.default,
                dashboard_storage_service_3.default,
                background_service_1.default])
        ], IzendaGalleryComponent);
        return IzendaGalleryComponent;
    }());
    exports.IzendaGalleryComponent = IzendaGalleryComponent;
});
izendaRequire.define("dashboard/components/dashboard/dashboard-component", ["require", "exports", "angular", "common/core/tools/izenda-component", "dashboard/module-definition", "common/core/services/localization-service", "common/core/services/compatibility-service", "dashboard/services/dashboard-storage-service", "dashboard/services/background-service", "dashboard/services/gallery-service", "izenda-external-libs"], function (require, exports, angular, izenda_component_12, module_definition_36, localization_service_8, compatibility_service_4, dashboard_storage_service_4, background_service_2, gallery_service_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Izenda dashboard component.
     */
    var IzendaDashboardComponent = /** @class */ (function () {
        function IzendaDashboardComponent($rx, $window, $element, $interval, $timeout, $rootScope, $izendaLocaleService, $izendaCompatibilityService, $izendaDashboardSettings, $izendaDashboardStorageService, $izendaBackgroundService, $izendaGalleryService) {
            this.$rx = $rx;
            this.$window = $window;
            this.$element = $element;
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$rootScope = $rootScope;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.$izendaDashboardSettings = $izendaDashboardSettings;
            this.$izendaDashboardStorageService = $izendaDashboardStorageService;
            this.$izendaBackgroundService = $izendaBackgroundService;
            this.$izendaGalleryService = $izendaGalleryService;
        }
        IzendaDashboardComponent.prototype.$onInit = function () {
            var _this = this;
            this.isLicenseFailed = !this.$izendaDashboardSettings.dashboardsAllowed;
            if (this.isLicenseFailed)
                return;
            this.exportProgress = null;
            this.tileWidth = 100;
            this.tileHeight = 100;
            this.tileContainerStyle = {
                height: 0,
                backgroundColor: 'transparent'
            };
            this.isMouseEventsEnabled = true;
            this.initGrid();
            this.galleryContainerStyle = {
                'height': 0
            };
            this.rootWidth = this.$element.find('.iz-dash-root').width();
            // subscribe
            this.previousWidth = this.$window.innerWidth;
            this.subscriptions = [
                this.$izendaDashboardStorageService.model.subscribeOnNext(this.$onDashboardModelUpdate, this),
                this.$izendaDashboardStorageService.isLoaded.subscribeOnNext(this.$onDashboardIsLoadedUpdate, this),
                this.$izendaDashboardStorageService.exportProgress.subscribeOnNext(function (newValue) {
                    _this.$timeout(function () { return _this.exportProgress = newValue; }, 1);
                }, this),
                //this.$izendaBackgroundService.background.subscribeOnNext(this.$onDashboardBackgroundChanged, this),
                this.$izendaDashboardStorageService.windowSize.subscribeOnNext(function (newWindowSize) {
                    if (_this.previousWidth === newWindowSize.width)
                        return;
                    _this.previousWidth = newWindowSize.width;
                    _this.rootWidth = _this.$element.find('.iz-dash-root').width();
                    _this.updateDashboardSize();
                    _this.$rootScope.$applyAsync();
                })
            ];
        };
        IzendaDashboardComponent.prototype.initGrid = function () {
            this.isGridVisible = false;
            this.gridStyle = null;
            this.isGridShadowVisible = false;
            this.isGridShadowPlusButtonVisible = false;
            this.gridShadowStyle = {
                'left': 0,
                'top': 0,
                'width': 0,
                'height': 0
            };
            this.updateGridStyle(); // init grid style
        };
        IzendaDashboardComponent.prototype.$onDestroy = function () {
            this.subscriptions.forEach(function (sub) { return sub.dispose(); });
        };
        /**
         * Dashboard model changed handler. Occurs when user navigates to existing or new dashboard.
         * @param {IzendaDashboardModel} newModel new dashboard model object.
         */
        IzendaDashboardComponent.prototype.$onDashboardModelUpdate = function (newModel) {
            this.model = newModel;
            if (!this.model)
                return;
            this.updateDashboardSize();
        };
        /**
         * Dashboard isLoaded changed handler.
         * @param {boolean} newIsLoaded new isLoaded value.
         */
        IzendaDashboardComponent.prototype.$onDashboardIsLoadedUpdate = function (newIsLoaded) {
            this.isLoaded = newIsLoaded;
        };
        /**
         * Event fires on tile drag start
         */
        IzendaDashboardComponent.prototype.$onTileDragStart = function (tile) {
            this.turnOffMouseHandlers();
            this.showGrid();
            this.showTileGridShadow({
                left: tile.x * this.tileWidth,
                top: tile.y * this.tileHeight,
                width: tile.width * this.tileWidth,
                height: tile.height * this.tileHeight
            }, false);
        };
        /**
         * Event fires on tile drag change position
         */
        IzendaDashboardComponent.prototype.$onTileDrag = function (tile, shadowPosition) {
            this.showTileGridShadow({
                left: shadowPosition.left,
                top: shadowPosition.top,
                width: shadowPosition.width,
                height: shadowPosition.height
            }, false);
            this.updateDashboardSize(shadowPosition);
        };
        /**
         * Event fires on tile drag end
         */
        IzendaDashboardComponent.prototype.$onTileDragEnd = function (eventResult) {
            this.hideGrid();
            this.turnOnMouseHandlers();
        };
        /**
         * Start tile resize event handler
         */
        IzendaDashboardComponent.prototype.$onTileResizeStart = function (tile) {
            this.turnOffMouseHandlers();
            this.showGrid();
            this.showTileGridShadow({
                left: tile.x * this.tileWidth,
                top: tile.y * this.tileHeight,
                width: tile.width * this.tileWidth,
                height: tile.height * this.tileHeight
            }, false);
        };
        /**
         * Tile resize handler
         */
        IzendaDashboardComponent.prototype.$onTileResize = function (tile, shadowPosition) {
            this.showTileGridShadow({
                left: shadowPosition.left,
                top: shadowPosition.top,
                width: shadowPosition.width,
                height: shadowPosition.height
            }, false);
            this.updateDashboardSize(shadowPosition);
        };
        /**
         * Tile resize completed handler
         */
        IzendaDashboardComponent.prototype.$onTileResizeEnd = function (eventResult) {
            this.hideGrid();
            this.turnOnMouseHandlers();
        };
        /**
         * Tile delete handler
         */
        IzendaDashboardComponent.prototype.$onTileDelete = function (tile) {
            if (tile == null)
                throw 'Tile not found';
            this.model.removeTile(tile);
            this.updateDashboardSize();
            this.$izendaDashboardStorageService.refreshFilters();
        };
        /**
         * Tile report selected handler.
         * @param {IzendaDashboardTileModel} tile tile model object.
         */
        IzendaDashboardComponent.prototype.$onTileReportSelected = function (tile) {
            this.$izendaDashboardStorageService.refreshFilters();
        };
        /**
         * Dashboard mouse hover
         */
        IzendaDashboardComponent.prototype.globalMousemoveHandler = function ($event) {
            if (!this.isMouseEventsEnabled) {
                return;
            }
            var $target = angular.element($event.target);
            if ($target.closest('.iz-dash-tile').length) {
                this.hideGrid();
                return;
            }
            // get {x, y} click coordinates
            var x = Math.floor($event.offsetX / this.tileWidth);
            var y = Math.floor($event.offsetY / this.tileHeight);
            this.showGrid();
            if ($target.hasClass('dashboard-grid') && $target.width() > 0) {
                this.showTileGridShadow({
                    left: x * this.tileWidth,
                    top: y * this.tileHeight,
                    width: this.tileWidth,
                    height: this.tileHeight
                }, true);
            }
        };
        /**
         * Dashboard mouse out
         */
        IzendaDashboardComponent.prototype.globalMouseoutHandler = function () {
            if (!this.isMouseEventsEnabled)
                return;
            this.hideGrid();
        };
        /**
         * Click to any part of the dashboard
         */
        IzendaDashboardComponent.prototype.globalClickHandler = function ($event) {
            if (!this.isMouseEventsEnabled)
                return true;
            if (typeof (event['which']) !== 'undefined' && event['which'] !== 1)
                return true;
            // get {x, y} click coordinates
            var x = Math.floor($event.offsetX / this.tileWidth);
            var y = Math.floor($event.offsetY / this.tileHeight);
            this.model.addPixelTile(x, y);
            this.updateDashboardSize();
            return false;
        };
        /**
         * Disable mouse move/out/click handlers for dashboard
         */
        IzendaDashboardComponent.prototype.turnOffMouseHandlers = function () {
            this.isMouseEventsEnabled = false;
            this.hideGrid();
        };
        /**
         * Enable mouse move/out/click handlers for dashboard
         */
        IzendaDashboardComponent.prototype.turnOnMouseHandlers = function () {
            this.isMouseEventsEnabled = true;
        };
        /**
         * Update tile container sizes
         * @param {object} additionalBox. If we want to extend dashboard container size we can
         * use this parameter and add additional area.
         */
        IzendaDashboardComponent.prototype.updateDashboardSize = function (additionalBox) {
            if (!this.model)
                return;
            this.updateTileSize();
            this.updateGallerySize();
            var isOneColumn = this.$izendaCompatibilityService.isOneColumnView();
            var maxHeight = this.model.getMaxHeight(isOneColumn);
            var maxHeightPixels = maxHeight * this.tileHeight;
            // update height of union of tiles and additional box it is set
            if (angular.isDefined(additionalBox))
                if (additionalBox.top + additionalBox.height > maxHeightPixels)
                    maxHeightPixels = additionalBox.top + additionalBox.height;
            // set height:
            this.tileContainerStyle.height = (maxHeightPixels + this.tileHeight + 1) + 'px';
        };
        /**
         * Update tile grid sizes
         */
        IzendaDashboardComponent.prototype.updateTileSize = function () {
            var width = Math.floor(this.rootWidth / 12) * 12 - 24;
            this.$element.find('.iz-dash-body-container').width(width);
            this.tileWidth = width / 12;
            this.tileHeight = this.tileWidth > 100 ? this.tileWidth : 100;
            this.updateGridStyle();
        };
        /**
         * Update tile grid style variable.
         */
        IzendaDashboardComponent.prototype.updateGridStyle = function () {
            this.gridStyle = {
                'background-size': this.tileWidth +
                    'px ' +
                    this.tileHeight +
                    'px, ' +
                    this.tileWidth +
                    'px ' +
                    this.tileHeight +
                    'px'
            };
        };
        /**
         * Update gallery container size
         */
        IzendaDashboardComponent.prototype.updateGallerySize = function () {
            var tileContainerTop = angular.element('.iz-dash-root').offset().top;
            this.galleryContainerStyle.height = angular.element(this.$window).height() - tileContainerTop - 30;
        };
        /**
         * Event handler which runs when user turns on fullscreen.
         * @param {boolean} isFullscreen
         */
        IzendaDashboardComponent.prototype.galleryToggleFullscreen = function (isFullscreen) {
            this.$izendaGalleryService.galleryState.isFullScreen = isFullscreen;
        };
        /**
         * Event handler which runs when gallery stop playing.
         * @param {boolean} isPlayStarted isPlayStarted
         */
        IzendaDashboardComponent.prototype.galleryTogglePlayStarted = function (isPlayStarted) {
            this.$izendaGalleryService.galleryState.isPlayStarted = isPlayStarted;
        };
        IzendaDashboardComponent.prototype.showGrid = function () {
            var isOneColumn = this.$izendaCompatibilityService.isOneColumnView();
            if (isOneColumn)
                return;
            this.isGridVisible = true;
        };
        IzendaDashboardComponent.prototype.hideGrid = function () {
            if (!this.isGridVisible)
                return;
            this.isGridVisible = false;
            this.hideTileGridShadow();
        };
        /**
         * Show tile grid shadow
         */
        IzendaDashboardComponent.prototype.showTileGridShadow = function (shadowBbox, showPlusButton) {
            var isOneColumn = this.$izendaCompatibilityService.isOneColumnView();
            if (isOneColumn)
                return;
            this.isGridShadowVisible = true;
            this.isGridShadowPlusButtonVisible = showPlusButton;
            var left = shadowBbox.left;
            var top = shadowBbox.top;
            var width = shadowBbox.width;
            var height = shadowBbox.height;
            if (left < 0)
                left = 0;
            if (left + width >= this.tileWidth * 12)
                left = this.tileWidth * 12 - width;
            if (top < 0)
                top = 0;
            this.gridShadowStyle = {
                'left': left + 1,
                'top': top + 1,
                'width': width - 1,
                'height': height - 1
            };
        };
        /**
         * Hide tile grid shadow
         */
        IzendaDashboardComponent.prototype.hideTileGridShadow = function () {
            this.isGridShadowVisible = false;
        };
        IzendaDashboardComponent.prototype.getExportWaitMessageHeaderText = function () {
            if (this.exportProgress === 'export')
                return this.$izendaLocaleService.localeText('js_ExportingInProgress', 'Exporting in progress.');
            if (this.exportProgress === 'print')
                return this.$izendaLocaleService.localeText('js_PrintingInProgress', 'Printing in progress.');
            return '';
        };
        IzendaDashboardComponent.prototype.getExportWaitMessageText = function () {
            if (this.exportProgress === 'export')
                return this.$izendaLocaleService.localeText('js_FinishExporting', 'Please wait till export is completed...');
            if (this.exportProgress === 'print')
                return this.$izendaLocaleService.localeText('js_FinishPrinting', 'Please finish printing before continue.');
            return '';
        };
        IzendaDashboardComponent = __decorate([
            izenda_component_12.default(module_definition_36.default, 'izendaDashboard', ['rx', '$window', '$element', '$interval', '$timeout', '$rootScope', '$izendaLocaleService', '$izendaCompatibilityService',
                '$izendaDashboardSettings', '$izendaDashboardStorageService', '$izendaBackgroundService', '$izendaGalleryService'], {
                templateUrl: '###RS###extres=components.dashboard.components.dashboard.dashboard-template.html'
            }),
            __metadata("design:paramtypes", [Object, Object, Object, Function, Function, Object, localization_service_8.default,
                compatibility_service_4.default, Object, dashboard_storage_service_4.default,
                background_service_2.default,
                gallery_service_1.default])
        ], IzendaDashboardComponent);
        return IzendaDashboardComponent;
    }());
    exports.IzendaDashboardComponent = IzendaDashboardComponent;
});
izendaRequire.define("dashboard/components/toolbar/toolbar-component", ["require", "exports", "angular", "common/core/tools/izenda-component", "dashboard/module-definition", "common/core/services/localization-service", "common/core/services/util-service", "common/core/services/util-ui-service", "common/core/services/compatibility-service", "common/query/services/url-service", "common/ui/services/schedule-service", "common/ui/services/share-service", "dashboard/services/dashboard-storage-service", "dashboard/services/background-service", "dashboard/services/gallery-service", "izenda-external-libs"], function (require, exports, angular, izenda_component_13, module_definition_37, localization_service_9, util_service_3, util_ui_service_6, compatibility_service_5, url_service_7, schedule_service_3, share_service_3, dashboard_storage_service_5, background_service_3, gallery_service_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaDashboardToolbarComponent = /** @class */ (function () {
        function IzendaDashboardToolbarComponent($rx, $window, $element, $interval, $timeout, $rootScope, dashboardConfig, $izendaSettingsService, $izendaLocaleService, $izendaUtilService, $izendaUtilUiService, $izendaCompatibilityService, $izendaUrlService, $izendaScheduleService, $izendaShareService, $izendaDashboardSettings, $izendaDashboardStorageService, $izendaBackgroundService, $izendaGalleryService) {
            this.$rx = $rx;
            this.$window = $window;
            this.$element = $element;
            this.$interval = $interval;
            this.$timeout = $timeout;
            this.$rootScope = $rootScope;
            this.dashboardConfig = dashboardConfig;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaUtilService = $izendaUtilService;
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaScheduleService = $izendaScheduleService;
            this.$izendaShareService = $izendaShareService;
            this.$izendaDashboardSettings = $izendaDashboardSettings;
            this.$izendaDashboardStorageService = $izendaDashboardStorageService;
            this.$izendaBackgroundService = $izendaBackgroundService;
            this.$izendaGalleryService = $izendaGalleryService;
            var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
            var isFirefox = /Firefox/.test(navigator.userAgent);
            this.isHueRotate = isChrome || isSafari || isFirefox;
            this.isHueRotateEnabled = false;
            this.isSaveReportModalOpened = false;
            this.isHtml5FullScreenSupported = this.$izendaCompatibilityService.isHtml5FullScreenSupported();
        }
        IzendaDashboardToolbarComponent.prototype.$onInit = function () {
            var _this = this;
            this.subscriptions = [];
            this.isLicenseFailed = !this.$izendaDashboardSettings.dashboardsAllowed;
            if (this.isLicenseFailed)
                return;
            this.scheduleModalOpened = false;
            this.shareModalOpened = false;
            // settings
            this.commonSettings = this.$izendaSettingsService.getCommonSettings();
            this.isDesignLinksAllowed = this.commonSettings.showDesignLinks;
            this.printMode = this.$izendaDashboardSettings.allowedPrintEngine;
            // background
            this.isStorageAvailable = this.$izendaBackgroundService.isStorageAvailable();
            this.selectBackgroundImageModalOpened = false;
            this.backgroundModalRadio = 'url';
            // button bar
            this.isButtonBarVisible = false;
            this.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel left-transition';
            this.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel left-transition opened';
            // refresh
            this.refreshInterval = null;
            this.autoRefresh = null;
            //email
            this.sendEmailModalOpened = false;
            this.sendEmailState = {
                errors: [],
                isLoading: false,
                errorOccured: false,
                sendType: 'Link',
                email: '',
                opened: false,
                focused: false
            };
            // subscribe
            this.subscriptions = [
                this.$izendaDashboardStorageService.model.subscribeOnNext(this.$onDashboardModelUpdate, this),
                this.$izendaDashboardStorageService.autoRefresh.subscribeOnNext(this.$onAutorefreshUpdate, this),
                this.$izendaDashboardStorageService.categories.subscribeOnNext(this.$onCategoriesUpdate, this),
                this.$izendaDashboardStorageService.currentCategory.subscribeOnNext(function (next) { return _this.currentCategory = next; }),
                this.$izendaDashboardStorageService.currentDashboard.subscribeOnNext(function (next) { return _this.currentDashboard = next; }),
                this.$izendaDashboardStorageService.windowSize.subscribeOnNext(function (newWindowSize) {
                    // resize handler
                }, this)
            ];
        };
        IzendaDashboardToolbarComponent.prototype.$onDestroy = function () {
            this.cancelRefreshInterval();
            this.subscriptions.forEach(function (sub) { return sub.dispose(); });
        };
        IzendaDashboardToolbarComponent.prototype.$onDashboardModelUpdate = function (newModel) {
            this.cancelRefreshInterval();
            this.model = newModel;
        };
        IzendaDashboardToolbarComponent.prototype.$onAutorefreshUpdate = function (newAutorefresh) {
            this.autoRefresh = newAutorefresh;
        };
        IzendaDashboardToolbarComponent.prototype.$onCategoriesUpdate = function (newCategories) {
            this.categories = newCategories;
        };
        /**
         * Create new dashboard button handler.
         */
        IzendaDashboardToolbarComponent.prototype.createNewDashboard = function () {
            this.$izendaDashboardStorageService.navigateNewDashboard();
        };
        /**
         * Save dashboard
         * @param {boolean} showNameDialog dashboard report set name.
         */
        IzendaDashboardToolbarComponent.prototype.saveDashboard = function (showNameDialog) {
            var _this = this;
            if (showNameDialog || !this.model.reportFullName) {
                this.isSaveReportModalOpened = true;
            }
            else {
                this.hideButtonBar();
                this.$izendaDashboardStorageService
                    .saveDashboard()
                    .then(function () {
                    _this.$izendaUtilUiService.showNotification(_this.$izendaLocaleService.localeText('js_DashboardSaved', 'Dashboard sucessfully saved'));
                }, function (error) {
                    var msgCantSave = _this.$izendaLocaleService.localeText('js_CantSaveDashboard', 'Can\'t save dashboard');
                    var msgError = _this.$izendaLocaleService.localeText('js_Error', 'Error');
                    var errorText = msgCantSave + " \"" + _this.model.reportFullName + "\". " + msgError + ": \"" + error + "\"";
                    _this.$izendaUtilUiService.showErrorDialog(errorText);
                });
            }
        };
        /**
          * Save dialog closed handler.
          */
        IzendaDashboardToolbarComponent.prototype.onSaveClosed = function () {
            this.hideButtonBar();
            this.isSaveReportModalOpened = false;
        };
        /**
         * Report name/category selected. Save report handler. In this scenario we have to turn button bar off
         */
        IzendaDashboardToolbarComponent.prototype.onSave = function (reportName, categoryName) {
            var _this = this;
            this.hideButtonBar(function () {
                _this.isSaveReportModalOpened = false;
                _this.$izendaDashboardStorageService
                    .saveDashboard(reportName, categoryName)
                    .then(function () {
                    _this.$izendaUtilUiService.showNotification(_this.$izendaLocaleService.localeText('js_DashboardSaved', 'Dashboard sucessfully saved'));
                }, function (error) {
                    var msgCantSave = _this.$izendaLocaleService.localeText('js_CantSaveDashboard', 'Can\'t save dashboard');
                    var msgError = _this.$izendaLocaleService.localeText('js_Error', 'Error');
                    var errorText = msgCantSave + " \"" + _this.model.reportFullName + "\". " + msgError + ": \"" + error + "\"";
                    _this.$izendaUtilUiService.showErrorDialog(errorText);
                });
            });
        };
        /**
         * Refresh all dashboard tiles (without reloading)
         * @param {number} intervalIndex auto refresh interval index. Automatic refresh will turn on if this argument is set.
         */
        IzendaDashboardToolbarComponent.prototype.refreshDashboard = function (intervalIndex) {
            var _this = this;
            this.$izendaDashboardStorageService.refreshDashboard(false, false);
            if (!this.autoRefresh)
                return;
            if (angular.isNumber(intervalIndex)) {
                this.cancelRefreshInterval();
                var selectedInterval = this.autoRefresh.intervals[intervalIndex];
                selectedInterval.selected = true;
                var intervalValue = selectedInterval.value;
                if (intervalValue >= 1) {
                    intervalValue *= 1000;
                    this.refreshInterval = setInterval(function () { return _this.$izendaDashboardStorageService.refreshDashboard(false, false); }, intervalValue);
                }
            }
        };
        IzendaDashboardToolbarComponent.prototype.closeScheduleDialog = function () {
            this.scheduleModalOpened = false;
        };
        IzendaDashboardToolbarComponent.prototype.closeShareDialog = function () {
            this.shareModalOpened = false;
        };
        IzendaDashboardToolbarComponent.prototype.openToolbarDashboard = function (dashboardObj) {
            this.$izendaDashboardStorageService.navigateToDashboard(dashboardObj.fullName);
        };
        IzendaDashboardToolbarComponent.prototype.showButtonBar = function () {
            this.isButtonBarVisible = true;
            this.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel transform-transition opened';
            this.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel transform-transition';
        };
        IzendaDashboardToolbarComponent.prototype.hideButtonBar = function (completedHandler) {
            var _this = this;
            this.isButtonBarVisible = false;
            this.buttonbarClass = 'nav navbar-nav iz-dash-toolbtn-panel';
            this.buttonbarCollapsedClass = 'nav navbar-nav iz-dash-collapsed-toolbtn-panel opened';
            this.$timeout(function () {
                if (angular.isFunction(completedHandler))
                    completedHandler.call(_this);
            }, 200);
        };
        /**
         * Activate/deactivate dashboard mode
         */
        IzendaDashboardToolbarComponent.prototype.toggleGalleryMode = function (enableGalleryMode) {
            if (enableGalleryMode)
                this.$izendaDashboardStorageService.toggleFiltersPanel(false);
            this.$izendaGalleryService.galleryState.isEnabled = enableGalleryMode;
        };
        /**
         * Open gallery in fullscreen mode
         */
        IzendaDashboardToolbarComponent.prototype.toggleGalleryModeFullScreen = function () {
            this.$izendaDashboardStorageService.toggleFiltersPanel(false);
            this.$izendaGalleryService.galleryState.isFullScreen = !this.$izendaGalleryService.galleryState.isFullScreen;
        };
        /**
         * Turn off/on gallery play
         */
        IzendaDashboardToolbarComponent.prototype.toggleGalleryPlay = function () {
            this.$izendaDashboardStorageService.toggleFiltersPanel(false);
            this.$izendaGalleryService.galleryState.isPlayStarted = !this.$izendaGalleryService.galleryState.isPlayStarted;
        };
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "selectedInterval", {
            /**
             * Get current selected interval
             */
            get: function () {
                if (!this.autoRefresh)
                    return null;
                var selected = this.autoRefresh.intervals.filter(function (interval) { return interval.selected; });
                if (selected.length > 1)
                    throw 'Found more than 2 selected refresh intervals';
                return selected.length ? selected[0] : null;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Stop current interval loop and unselect current interval in UI.
         */
        IzendaDashboardToolbarComponent.prototype.cancelRefreshInterval = function () {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
            if (!this.autoRefresh)
                return;
            if (angular.isArray(this.autoRefresh.intervals)) {
                this.autoRefresh.intervals.forEach(function (interval) {
                    interval.selected = false;
                });
            }
        };
        /**
         * Toggle dashboard filters panel
         */
        IzendaDashboardToolbarComponent.prototype.toggleDashboardFilters = function () {
            if (this.isFiltersEditAllowed) {
                this.$izendaDashboardStorageService.toggleFiltersPanel();
            }
        };
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "hueRotateBtnImageUrl", {
            /**
             * Hue rotate toolbar btn icon
             */
            get: function () {
                return this.$izendaUrlService.settings.urlRpPage + 'extres=images.color' + (!this.isHueRotateEnabled ? '-bw' : '') + '.png';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isOneColumnView", {
            /**
             * Check if one column view required
             */
            get: function () {
                return this.$izendaCompatibilityService.isOneColumnView();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isFullAccess", {
            /**
             * Check is filters allowed
            */
            get: function () {
                return this.$izendaCompatibilityService.isFullAccess();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isFiltersEditAllowed", {
            /**
             * Check is filters allowed
             */
            get: function () {
                return this.$izendaCompatibilityService.isFiltersEditAllowed();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isSaveAllowed", {
            /**
             * Check is save allowed
             */
            get: function () {
                return this.model && this.$izendaCompatibilityService.isSaveAllowedWithHidden() && !this.model.tilesWithHiddenColumns.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isSaveAsAllowed", {
            /**
             * Check is save as allowed
             */
            get: function () {
                return this.model && this.$izendaCompatibilityService.isSaveAsAllowed() && !this.model.tilesWithHiddenColumns.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isShowSaveControls", {
            /**
             * Show or not save controls
             */
            get: function () {
                return this.commonSettings.showSaveControls;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isShowSaveAsToolbarButton", {
            /**
             * Is "save as" button allowed
             */
            get: function () {
                return this.commonSettings.showSaveAsToolbarButton;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isReadOnly", {
            /**
             * Check is edit allowed
             */
            get: function () {
                return this.$izendaCompatibilityService.isEditAllowed();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isToggleHueRotateEnabled", {
            /**
             * Check toggleHueRotateEnabled
             */
            get: function () {
                return this.isHueRotate;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Background modal "OK" click handler
         */
        IzendaDashboardToolbarComponent.prototype.$onBackgroundDialogHandlerOk = function () {
            this.selectBackgroundImageModalOpened = false;
            if (this.backgroundModalRadio === 'file')
                this.setBackgroundImageFromLocalhost();
        };
        /**
         * Background file/url changed handler
         */
        IzendaDashboardToolbarComponent.prototype.$onBackgroundModalRadioChange = function () {
            this.$izendaBackgroundService.backgroundImageType = this.backgroundModalRadio;
        };
        /**
         * Set file selected in file input as background
         */
        IzendaDashboardToolbarComponent.prototype.setBackgroundImageFromLocalhost = function () {
            var _this = this;
            var $fileBtn = angular.element('#izendaDashboardBackground');
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                if ($fileBtn[0]['files'].length === 0)
                    return;
                var file = $fileBtn[0]['files'][0];
                // test file information
                if (!file.type.match('image.*')) {
                    alert(this.$izendaLocaleService.localeText('js_ShouldBeImage', 'File should be image'));
                    return;
                }
                // read the file:
                // TODO READER + TYPESCRIPT!
                var reader = new FileReader();
                reader.onload = function (event) {
                    var bytes = event.target.result;
                    _this.$izendaBackgroundService.backgroundImageBase64 = bytes;
                };
                //reader.onload = (() => {
                //	return event => {
                //		var bytes = event.target.result;
                //		this.$izendaBackgroundService.backgroundImageBase64 = bytes;
                //	};
                //})(file);
                // Read in the image file as a data URL.
                reader.readAsDataURL(file);
            }
        };
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isBackgroundImageSet", {
            get: function () {
                return this.$izendaBackgroundService.backgroundImageBase64 || this.$izendaBackgroundService.backgroundImageUrl;
            },
            enumerable: true,
            configurable: true
        });
        IzendaDashboardToolbarComponent.prototype.removeBackgroundImageHandler = function () {
            this.$izendaBackgroundService.backgroundImageBase64 = '';
            this.$izendaBackgroundService.backgroundImageUrl = '';
        };
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isPrintDashboardVisible", {
            // PRINT
            /**
             * Is html model enabled in AdHocSettings
             */
            get: function () {
                return this.printMode === 'Html' || this.printMode === 'Html2PdfAndHtml';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isPrintDashboardPdfVisible", {
            /**
             * Is html2pdf mode enabled in AdHocSettings
             */
            get: function () {
                return this.printMode === 'Html2Pdf' || this.printMode === 'Html2PdfAndHtml';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IzendaDashboardToolbarComponent.prototype, "isPrintDropdownVisible", {
            /**
             * Is print button visible
             */
            get: function () {
                return this.isPrintDashboardPdfVisible || this.isPrintDashboardVisible;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Print whole dashboard
         */
        IzendaDashboardToolbarComponent.prototype.printDashboard = function () {
            var _this = this;
            this.$izendaDashboardStorageService.printDashboard('html').then(function () {
                // HTML print print successfully completed handler
            }, function (error) {
                var errorTitle = _this.$izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error');
                var errorText = _this.$izendaLocaleService.localeText('js_FailedPrintReport', 'Failed to print report "{0}". Error description: {1}.');
                errorText = errorText.replaceAll('{0}', _this.model.reportFullName ? _this.model.reportFullName : '');
                errorText = errorText.replaceAll('{1}', error);
                _this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
                console.error(error);
            });
        };
        /**
         * Print dashboard as pdf
         */
        IzendaDashboardToolbarComponent.prototype.printDashboardPdf = function () {
            var _this = this;
            this.$izendaDashboardStorageService.printDashboard('pdf').then(function () {
                // PDF print print successfully completed handler
            }, function (error) {
                var errorTitle = _this.$izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error');
                var errorText = _this.$izendaLocaleService.localeText('js_FailedPrintReport', 'Failed to print report "{0}". Error description: {1}.');
                errorText = errorText.replaceAll('{0}', _this.model.reportFullName ? _this.model.reportFullName : '');
                errorText = errorText.replaceAll('{1}', error);
                _this.$izendaUtilUiService.showErrorDialog(errorText, errorTitle);
                console.error(error);
            });
        };
        // EMAIL
        /**
         * Open send email dialog
         */
        IzendaDashboardToolbarComponent.prototype.showEmailModal = function (type) {
            this.sendEmailState.isLoading = false;
            this.sendEmailState.opened = true;
            this.sendEmailState.sendType = type;
            this.sendEmailState.email = '';
            this.sendEmailState.errors = [];
            this.sendEmailState.errorOccured = false;
        };
        /**
         * Send email dialog shown event.
         */
        IzendaDashboardToolbarComponent.prototype.setFocus = function () {
            var _this = this;
            this.$timeout(function () {
                _this.sendEmailState.focused = true;
            }, 1);
        };
        /**
         * Close send email dialog
         */
        IzendaDashboardToolbarComponent.prototype.hideEmailModal = function (success) {
            var _this = this;
            this.sendEmailState.focused = false;
            this.sendEmailState.errorOccured = true;
            this.sendEmailState.errors = [];
            if (success) {
                // OK pressed
                var isEmailValid = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(this.sendEmailState
                    .email);
                if (!isEmailValid) {
                    this.sendEmailState.errorOccured = true;
                    this.sendEmailState.errors.push(this.$izendaLocaleService.localeText('js_IncorrectEmail', 'Incorrect Email'));
                }
                else {
                    this.sendEmailState.isLoading = true;
                    this.$izendaDashboardStorageService.sendEmail(this.sendEmailState.sendType, this.sendEmailState.email).then(function (result) {
                        _this.sendEmailState.opened = false;
                        if (result === 'OK') {
                            _this.$izendaUtilUiService.showNotification(_this.$izendaLocaleService.localeText('js_EmailWasSent', 'Email  was sent'));
                        }
                        else {
                            var errorText = _this.$izendaLocaleService.localeText('js_FailedToSendEmail', 'Failed to send email');
                            _this.$izendaUtilUiService.showErrorDialog(errorText);
                        }
                    }, function (error) {
                        console.error(error);
                        var errorText = _this.$izendaLocaleService.localeText('js_FailedToSendEmail', 'Failed to send email');
                        _this.$izendaUtilUiService.showErrorDialog(errorText);
                    });
                }
            }
            else {
                // cancel pressed
                this.sendEmailState.opened = false;
            }
        };
        /**
         * Send dashboard via email
         */
        IzendaDashboardToolbarComponent.prototype.sendEmail = function (type) {
            if (type === 'Link') {
                if (!this.model.reportFullName) {
                    var errorText = this.$izendaLocaleService.localeText('js_CantSendUnsavedLink', 'Cannot email link to unsaved dashboard');
                    this.$izendaUtilUiService.showNotification(errorText);
                    return;
                }
                var redirectUrl = "?subject=" + encodeURIComponent(this.model.reportFullName) + "&body=" + encodeURIComponent(location.href);
                redirectUrl = "mailto:" + redirectUrl.replace(/ /g, '%20');
                window.top.location.href = redirectUrl;
            }
            else
                this.showEmailModal(type);
        };
        IzendaDashboardToolbarComponent = __decorate([
            izenda_component_13.default(module_definition_37.default, 'izendaDashboardToolbar', ['rx', '$window', '$element', '$interval', '$timeout', '$rootScope',
                'izendaDashboardConfig', '$izendaSettingsService', '$izendaLocaleService', '$izendaUtilService', '$izendaUtilUiService',
                '$izendaCompatibilityService', '$izendaUrlService',
                '$izendaScheduleService', '$izendaShareService', '$izendaDashboardSettings', '$izendaDashboardStorageService',
                '$izendaBackgroundService', '$izendaGalleryService'], {
                templateUrl: '###RS###extres=components.dashboard.components.toolbar.toolbar-template.html'
            }),
            __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, localization_service_9.default,
                util_service_3.default,
                util_ui_service_6.default,
                compatibility_service_5.default,
                url_service_7.default,
                schedule_service_3.default,
                share_service_3.default, Object, dashboard_storage_service_5.default,
                background_service_3.default,
                gallery_service_2.default])
        ], IzendaDashboardToolbarComponent);
        return IzendaDashboardToolbarComponent;
    }());
});
izendaRequire.define("dashboard/module", ["require", "exports", "dashboard/module-definition", "dashboard/services/background-service", "dashboard/services/dashboard-query-service", "dashboard/services/gallery-service", "dashboard/services/dashboard-storage-service", "izenda-external-libs", "dashboard/directives/dashboard-background", "dashboard/directives/tile-top-slider", "dashboard/directives/toolbar-folder-menu-accordion", "dashboard/directives/toolbar-links-panel", "dashboard/components/tile/tile-draggable-directive", "dashboard/components/tile/tile-flip-directive", "dashboard/components/tile/tile-hover-directive", "dashboard/components/tile/tile-resizable-directive", "dashboard/components/tile-back/tile-back-component", "dashboard/components/tile/tile-component", "dashboard/components/filter/filter-component", "dashboard/components/gallery/gallery-component", "dashboard/components/dashboard/dashboard-component", "dashboard/components/toolbar/toolbar-component"], function (require, exports, module_definition_38, background_service_4, dashboard_query_service_1, gallery_service_3, dashboard_storage_service_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // register services
    background_service_4.default.register(module_definition_38.default);
    dashboard_query_service_1.default.register(module_definition_38.default);
    gallery_service_3.default.register(module_definition_38.default);
    dashboard_storage_service_6.default.register(module_definition_38.default);
});
izendaRequire.define("common/core/tools/izenda-linq", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaLinq;
    (function (IzendaLinq) {
        Array.prototype.firstOrDefault = function (predicate) {
            return this.reduce(function (accumulator, currentValue) {
                if (!accumulator && predicate(currentValue))
                    accumulator = currentValue;
                return accumulator;
            }, null);
        };
        Array.prototype.pushAll = function (collection) {
            var _this = this;
            if (collection === null)
                return this;
            collection.forEach(function (t) { return _this.push(t); });
            return this;
        };
        Array.prototype.firstOrDefaultInInner = function (innerObjectKey, innerObjectPredicate) {
            for (var i = 0; i < this.length; i++) {
                var parentObject = this[i];
                if (!parentObject.hasOwnProperty(innerObjectKey))
                    throw "Key " + innerObjectKey + " not found in object " + parentObject;
                var innerObject = parentObject[innerObjectKey];
                if (innerObject && innerObject instanceof Array) {
                    var foundInner = innerObject.firstOrDefault(innerObjectPredicate);
                    if (foundInner)
                        return foundInner;
                }
            }
            return null;
        };
        Array.prototype.filterInInner = function (innerObjectKey, innerObjectPredicate) {
            return this.reduce(function (result, currentTopLevel) {
                if (!currentTopLevel.hasOwnProperty(innerObjectKey))
                    throw "Key " + innerObjectKey + " not found in object " + currentTopLevel;
                var inner = currentTopLevel[innerObjectKey];
                if (inner && inner instanceof Array)
                    return result.concat(inner.filter(innerObjectPredicate));
                return result;
            }, []);
        };
    })(IzendaLinq = exports.IzendaLinq || (exports.IzendaLinq = {}));
});
