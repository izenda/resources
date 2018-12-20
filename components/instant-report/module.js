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
izendaRequire.define("instant-report/models/instant-report-config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
izendaRequire.define("instant-report/module-definition", ["require", "exports", "angular", "common/ui/module-definition", "common/common-module-definition", "izenda-external-libs", "common/core/module", "common/query/module", "common/ui/module"], function (require, exports, angular, module_definition_23, common_module_definition_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Create instant report angular module
    var izendaInstantReportModule = angular.module('izendaInstantReport', [
        'ngCookies',
        'rx',
        'izenda.common.core',
        'izenda.common.query',
        'izenda.common.ui'
    ]);
    exports.default = izendaInstantReportModule;
    // configure common ui module:
    module_definition_23.default
        .value('izenda.common.ui.reportNameInputPlaceholderText', ['js_ReportName', 'Report Name'])
        .value('izenda.common.ui.reportNameEmptyError', ['js_NameCantBeEmpty', 'Report name can\'t be empty.'])
        .value('izenda.common.ui.reportNameInvalidError', ['js_InvalidReportName', 'Invalid report name']);
    var IzendaInstantReportLoader = /** @class */ (function () {
        function IzendaInstantReportLoader() {
        }
        IzendaInstantReportLoader.configureInstantReportModules = function (instantReportConfig) {
            // configure instant report module
            var module = izendaInstantReportModule
                .config(['$logProvider', function ($logProvider) { return $logProvider.debugEnabled(false); }])
                .config(['$provide', function ($provide) {
                    $provide.decorator('$browser', ['$delegate', function ($delegate) {
                            $delegate.onUrlChange = function () { };
                            $delegate.url = function () { return ''; };
                            return $delegate;
                        }]);
                }])
                .value('$izendaInstantReportSettingsValue', instantReportConfig);
            return module;
        };
        /**
         * Bootstrap angular app:
         * window.urlSettings$ objects should be defined before this moment.
         */
        IzendaInstantReportLoader.bootstrap = function () {
            angular.element(document).ready(function () {
                // common settings promise:
                var commonQuerySettingsPromise = common_module_definition_1.IzendaCommonLoader.loadSettings();
                // instant report settings promise:
                var urlSettings = window.urlSettings$;
                var rsPageUrl = urlSettings.urlRsPage;
                var settingsUrl = rsPageUrl + '?wscmd=getInstantReportSettings';
                var instantReportSettingsPromise = angular.element.get(settingsUrl);
                // wait while all settings are loaded:
                angular.element
                    .when(commonQuerySettingsPromise, instantReportSettingsPromise)
                    .then(function (commonSettingsResult, instantReportSettingsResult) {
                    // get instant report config object
                    var configObject = instantReportSettingsResult[0];
                    configObject.moveUncategorizedToLastPosition = true;
                    // create and configure modules:
                    IzendaInstantReportLoader.configureInstantReportModules(configObject);
                    // bootstrap application:
                    angular.element('#izendaInstantReportRootContainer').removeClass('hidden');
                    angular.bootstrap('#izendaInstantReportRootContainer', ['izendaInstantReport']);
                });
            });
        };
        return IzendaInstantReportLoader;
    }());
    exports.IzendaInstantReportLoader = IzendaInstantReportLoader;
});
izendaRequire.define("instant-report/services/instant-report-query", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Izenda query service which provides dashboard specific queries
     * this is singleton
     */
    var IzendaInstantReportQueryService = /** @class */ (function () {
        function IzendaInstantReportQueryService($q, $http, $window, $izendaLocaleService, $izendaUtilUiService, $izendaUrlService, $izendaSettingsService, $izendaRsQueryService) {
            this.$q = $q;
            this.$http = $http;
            this.$window = $window;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaRsQueryService = $izendaRsQueryService;
            this.requestList = [];
        }
        Object.defineProperty(IzendaInstantReportQueryService, "injectModules", {
            get: function () {
                return ['$q', '$http', '$window', '$izendaLocaleService', '$izendaUtilUiService', '$izendaUrlService',
                    '$izendaSettingsService', '$izendaRsQueryService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Get type group of field operator
         */
        IzendaInstantReportQueryService.prototype.getFieldFilterOperatorValueType = function (operator) {
            var hiddenOperators = ['Blank', 'NotBlank', 'UsePreviousOR', 'True', 'False'];
            var oneValueOperators = [
                'LessThan', 'GreaterThan', 'LessThanNot', 'GreaterThanNot', 'Equals', 'NotEquals', 'Like',
                'BeginsWith', 'EndsWith', 'NotLike', 'LessThan_DaysOld', 'GreaterThan_DaysOld', 'Equals_DaysOld',
                'LessThan_DaysOld',
                'GreaterThan_DaysOld', 'Equals_DaysOld'
            ];
            var twoValueOperators = ['Between', 'NotBetween'];
            var selectValuesOperators = ['Equals_Select', 'NotEquals_Select'];
            var selectMultipleValuesOperators = ['Equals_Multiple', 'NotEquals_Multiple'];
            var selectPopupValuesOperators = ['EqualsPopup', 'NotEqualsPopup'];
            var selectCheckboxesValuesOperators = ['Equals_CheckBoxes'];
            var selectOneDateOperators = ['EqualsCalendar', 'NotEqualsCalendar'];
            var selectTwoDatesOperators = ['BetweenTwoDates', 'NotBetweenTwoDates'];
            var fieldOperators = ['LessThanField', 'GreaterThanField', 'EqualsField', 'NotEqualsField'];
            var inTimePeriod = ['InTimePeriod'];
            if (!angular.isObject(operator))
                return 'hidden';
            if (!operator.value || hiddenOperators.indexOf(operator.value) >= 0)
                return 'hidden';
            if (oneValueOperators.indexOf(operator.value) >= 0)
                return 'oneValue';
            if (twoValueOperators.indexOf(operator.value) >= 0)
                return 'twoValues';
            if (selectValuesOperators.indexOf(operator.value) >= 0)
                return 'select';
            if (selectMultipleValuesOperators.indexOf(operator.value) >= 0)
                return 'select_multiple';
            if (selectPopupValuesOperators.indexOf(operator.value) >= 0)
                return 'select_popup';
            if (selectCheckboxesValuesOperators.indexOf(operator.value) >= 0)
                return 'select_checkboxes';
            if (selectOneDateOperators.indexOf(operator.value) >= 0)
                return 'oneDate';
            if (selectTwoDatesOperators.indexOf(operator.value) >= 0)
                return 'twoDates';
            if (fieldOperators.indexOf(operator.value) >= 0)
                return 'field';
            if (inTimePeriod.indexOf(operator.value) >= 0) {
                return 'inTimePeriod';
            }
            return operator.value;
        };
        /**
         * Calculate current actual type group for field.
         */
        IzendaInstantReportQueryService.prototype.getCurrentTypeGroup = function (field, dataTypeGroup) {
            var typeGroup;
            if (angular.isDefined(dataTypeGroup)) {
                typeGroup = dataTypeGroup;
            }
            else {
                var expressionType = field.expressionType;
                typeGroup = angular.isObject(expressionType) && expressionType.value !== '...'
                    ? expressionType.value
                    : field.typeGroup;
            }
            return typeGroup;
        };
        /**
         * Get datasources
         */
        IzendaInstantReportQueryService.prototype.getDatasources = function () {
            return this.$izendaRsQueryService.query('getjsonschema', ['lazy'], {
                dataType: 'json'
            }, {
                handler: function () { return 'Failed to get datasources'; },
                params: []
            });
        };
        /**
         * Load field info by given sql column name.
         */
        IzendaInstantReportQueryService.prototype.getFieldsInfo = function (fieldSysName) {
            return this.$izendaRsQueryService.query('getfieldsinfo', [fieldSysName], {
                dataType: 'json'
            }, {
                handler: function (fieldName) { return "Failed to get field info for field " + fieldName; },
                params: [fieldSysName]
            });
        };
        /**
         * Search fields in datasources (returns range of values [from, to])
         */
        IzendaInstantReportQueryService.prototype.findInDatasources = function (searchString, from, to) {
            var params = [encodeURIComponent(searchString)];
            if (angular.isNumber(from) && angular.isNumber(to))
                params = params.concat(String(from), String(to));
            return this.$izendaRsQueryService.query('findfields', params, {
                dataType: 'json'
            }, {
                handler: function (sString) { return "Failed to search fields and tables by keyword: " + sString; },
                params: [searchString]
            });
        };
        /**
         * Load report json config
         */
        IzendaInstantReportQueryService.prototype.loadReport = function (reportFullName) {
            return this.$izendaRsQueryService.apiQuery('loadReportSetConfigJson', [reportFullName]);
        };
        /**
         * Cancel all running preview queries. All queries will be rejected.
         */
        IzendaInstantReportQueryService.prototype.cancelAllPreviewQueries = function () {
            for (var i = 0; i < this.requestList.length; i++) {
                var request = this.requestList[i];
                request.canceller.resolve('Cancelled!');
            }
            this.requestList = [];
        };
        ;
        /**
         * Run reportSet preview request. If request R2 have come earlier that request R1 - R1 request cancels.
         */
        IzendaInstantReportQueryService.prototype.getReportSetPreviewQueued = function (reportSetConfig) {
            var _this = this;
            this.cancelAllPreviewQueries();
            // prepare params
            var paramsArray = [
                'iic=1',
                'urlencoded=true',
                'wscmd=getNewReportSetPreviewFromJson',
                "wsarg0=" + encodeURIComponent(JSON.stringify(reportSetConfig))
            ];
            if (typeof (window.izendaPageId$) !== 'undefined')
                paramsArray.push("izpid=" + window.izendaPageId$);
            if (typeof (window.angularPageId$) !== 'undefined')
                paramsArray.push("anpid=" + window.angularPageId$);
            var rnParamValue = (reportSetConfig.reportCategory
                ? reportSetConfig.reportCategory + this.$izendaSettingsService.getCategoryCharacter() + reportSetConfig.reportName
                : reportSetConfig.reportName);
            var resolver = this.$q.defer();
            var canceller = this.$q.defer();
            var req = {
                method: 'POST',
                url: this.$izendaUrlService.settings.urlRsPage,
                params: { 'rnalt': rnParamValue },
                timeout: canceller.promise,
                dataType: 'text',
                data: paramsArray.join('&'),
                headers: {
                    'Content-Type': 'text/html'
                }
            };
            // add request to current requests list
            this.requestList.push({
                canceller: canceller,
                resolver: resolver
            });
            var requestPromise = this.$http(req);
            requestPromise
                .then(function (response) { return resolver.resolve(response.data); }, function (response) {
                if (response.config.timeout.$$state.value !== 'Cancelled!') {
                    //handle errors:
                    var errorText = _this.$izendaLocaleService.localeText('js_FailedToLoadPreview', 'Failed to load preview.');
                    _this.$izendaUtilUiService.showErrorDialog(errorText);
                    resolver.reject(response.data);
                }
            });
            return resolver.promise;
        };
        /**
         * Create report set from json and save it.
         */
        IzendaInstantReportQueryService.prototype.saveReportSet = function (reportSetConfig) {
            var paramsString = JSON.stringify(reportSetConfig);
            return this.$izendaRsQueryService.apiQuery('saveReportSetNew', [paramsString]);
        };
        /**
         * Create report set from json and set it as CurrentReportSet.
         */
        IzendaInstantReportQueryService.prototype.setReportAsCrs = function (reportSetConfig) {
            var paramsString = JSON.stringify(reportSetConfig);
            return this.$izendaRsQueryService.query('setReportSetFromJsonToCrs', [paramsString], {
                dataType: 'text',
                headers: {
                    'Content-Type': 'text/html'
                },
                method: 'POST'
            }, {
                handler: function () { return 'Failed to set current report as CurrentReportSet'; }
            });
        };
        ;
        /**
         * Open window for print.
         */
        IzendaInstantReportQueryService.prototype.openPrintWindow = function (parameters, resolve) {
            // open html print window
            var form = document.createElement('form');
            form.action = this.$izendaUrlService.settings.urlRsPage;
            form.method = 'POST';
            // set custom (our) window as target window
            form.target = 'form-target';
            if (parameters) {
                for (var key in parameters) {
                    if (parameters.hasOwnProperty(key)) {
                        var input = document.createElement('textarea');
                        input.name = key;
                        input.value = typeof parameters[key] === 'object'
                            ? JSON.stringify(parameters[key])
                            : parameters[key];
                        form.appendChild(input);
                    }
                }
            }
            form.style.display = 'none';
            document.body.appendChild(form);
            // open window for form and submit for into that window
            var formWindow = window.open('', 'form-target', '');
            form.submit();
            // workaround for webkit ajax request block
            if ('WebkitAppearance' in document.documentElement.style) {
                var intervalId = setInterval(function () {
                    if (!formWindow || formWindow.closed) {
                        clearInterval(intervalId);
                        intervalId = null;
                        resolve();
                    }
                }, 500);
            }
            else
                resolve();
        };
        /**
         * Open url in new window.
         */
        IzendaInstantReportQueryService.prototype.exportReportInNewWindow = function (reportSetToSend, exportType) {
            var _this = this;
            return this.$q(function (resolve) {
                // create url for export
                var urlParams = {
                    'wscmd': exportType === 'print' ? 'printReportSet' : 'exportReportSet',
                    'wsarg0': JSON.stringify(reportSetToSend),
                    'wsarg1': exportType
                };
                if (typeof (_this.$window.izendaPageId$) !== 'undefined')
                    urlParams['izpid'] = _this.$window.izendaPageId$;
                if (exportType !== 'print') {
                    // export file
                    _this.$izendaRsQueryService.downloadFileRequest('POST', _this.$izendaUrlService.settings.urlRsPage, urlParams)
                        .then(function () {
                        resolve();
                    });
                }
                else {
                    // print html
                    _this.openPrintWindow(urlParams, resolve);
                }
            });
        };
        IzendaInstantReportQueryService.prototype.getVisualizationConfig = function () {
            return this.$izendaRsQueryService.query('getVisualizationConfig', [], {
                dataType: 'json'
            }, {
                handler: function () { return 'Failed to get visualizations config'; }
            });
        };
        /**
         * Get list of constraints
         */
        IzendaInstantReportQueryService.prototype.getConstraintsInfo = function () {
            return this.$izendaRsQueryService.query('getconstraintslist', [], {
                dataType: 'json'
            }, {
                handler: function () { return 'Failed to get constraints info'; }
            });
        };
        IzendaInstantReportQueryService.prototype.getFieldFunctions = function (field, functionPurpose) {
            if (!angular.isObject(field))
                throw 'Field should be object';
            var parameters = null;
            var typeGroup = this.getCurrentTypeGroup(field);
            if (functionPurpose === 'subtotal') {
                // available functions for subtotals
                parameters = {
                    'cmd': 'GetOptionsByPath',
                    'p': 'FunctionList',
                    'type': field.sqlType,
                    'typeGroup': typeGroup,
                    'includeBlank': 'true',
                    'includeGroupBy': 'false',
                    'forSubtotals': 'true',
                    'extraFunction': 'false',
                    'forDundasMap': 'false',
                    'onlyNumericResults': 'false',
                    'resultType': 'json'
                };
            }
            else if (functionPurpose === 'field') {
                // available functions for column
                parameters = {
                    'cmd': 'GetOptionsByPath',
                    'p': 'FunctionList',
                    'type': field.sqlType,
                    'typeGroup': typeGroup,
                    'includeBlank': 'true',
                    'includeGroupBy': 'true',
                    'forSubtotals': 'false',
                    'extraFunction': 'false',
                    'forDundasMap': 'false',
                    'onlyNumericResults': 'false',
                    'resultType': 'json'
                };
            }
            else if (functionPurpose === 'pivotField') {
                parameters = {
                    'cmd': 'GetOptionsByPath',
                    'p': 'FunctionList',
                    'type': field.sqlType,
                    'typeGroup': typeGroup,
                    'includeBlank': 'true',
                    'includeGroupBy': 'true',
                    'forSubtotals': 'false',
                    'extraFunction': 'true',
                    'forDundasMap': 'false',
                    'onlyNumericResults': 'false',
                    'resultType': 'json'
                };
            }
            return this.$izendaRsQueryService.rsQuery(parameters, {
                dataType: 'json',
                cache: true
            }, {
                handler: function (fieldParam) { return "Failed to get function list info for field " + fieldParam.sysname; },
                params: [field]
            });
        };
        IzendaInstantReportQueryService.prototype.getPeriodList = function () {
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'PeriodList',
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function () { return 'Failed to get period list.'; },
                params: []
            });
        };
        ;
        IzendaInstantReportQueryService.prototype.getExistentPopupValuesList = function (field, table) {
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'ExistentPopupValuesList',
                'columnName': field.sysname,
                'tbl0': table.sysname,
                'ta0': '',
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function () { return 'Failed to get custom popups styles.'; },
                params: []
            });
        };
        ;
        IzendaInstantReportQueryService.prototype.getDrillDownStyles = function () {
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'DrillDownStyleList',
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function () { return 'Failed to get drilldown styles.'; },
                params: []
            });
        };
        IzendaInstantReportQueryService.prototype.getExpressionTypes = function () {
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'ExpressionTypeList',
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function () { return 'Failed to get expression types.'; },
                params: []
            });
        };
        IzendaInstantReportQueryService.prototype.getSubreports = function () {
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'SubreportsList',
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function () { return 'Failed to get subreports.'; },
                params: []
            });
        };
        IzendaInstantReportQueryService.prototype.getVgStyles = function () {
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'VgStyleList',
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function () { return 'Failed to get available visual group styles.'; },
                params: []
            });
        };
        IzendaInstantReportQueryService.prototype.getFieldFormats = function (field, dataTypeGroup) {
            if (!angular.isObject(field))
                throw 'Field should be object';
            var typeGroup = this.getCurrentTypeGroup(field, dataTypeGroup);
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'FormatList',
                'typeGroup': typeGroup,
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function (fieldParam) { return "Failed to get format list info for field " + fieldParam.sysname; },
                params: [field]
            });
        };
        IzendaInstantReportQueryService.prototype.getFilterFormats = function (filter) {
            if (!angular.isObject(filter) || !angular.isObject(filter.field))
                throw 'filter and filter.field should be objects.';
            var typeGroup = this.getCurrentTypeGroup(filter.field);
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'FormatList',
                'typeGroup': typeGroup,
                'onlySimple': 'true',
                'forceSimple': 'true',
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function (filterParam) { return "Failed to get format list info for filter " + filterParam.field.sysname; },
                params: [filter]
            });
        };
        IzendaInstantReportQueryService.prototype.getFieldOperatorList = function (field, tablesString, dataTypeGroup) {
            if (!angular.isObject(field))
                throw 'Field should be object.';
            var typeGroup = this.getCurrentTypeGroup(field, dataTypeGroup);
            return this.$izendaRsQueryService.rsQuery({
                'cmd': 'GetOptionsByPath',
                'p': 'OperatorList',
                'typeGroup': typeGroup,
                'tables': tablesString,
                'colFullName': field.sysname,
                'resultType': 'json'
            }, {
                dataType: 'json',
                cache: true
            }, {
                handler: function (fieldParam) { return "Failed to get operator list for field " + fieldParam.sysname; },
                params: [field]
            });
        };
        IzendaInstantReportQueryService.prototype.getExistentValuesList = function (tables, constraintFilters, filter, simpleJoins, filterLogic) {
            var _this = this;
            if (filter.field === null || !angular.isString(filter.field.sysname))
                throw 'filter field sysname should be defined.';
            if (!angular.isArray(tables))
                throw 'tables should be array';
            // create base query params
            var queryParams = {
                'cmd': 'GetOptionsByPath',
                'p': 'ExistentValuesList',
                'columnName': filter.field.sysname,
                'resultType': 'json'
            };
            if (angular.isString(filter.possibleValue)) {
                queryParams['possibleValue'] = filter.possibleValue.replace('&', '%26');
            }
            // add constraint filters params
            var counter = 0;
            if (constraintFilters)
                constraintFilters.forEach(function (constraintFilter) {
                    var constraintFilterOperatorValue = constraintFilter && constraintFilter.operator ? constraintFilter.operator.value : '';
                    if (constraintFilter.field !== null && angular.isObject(constraintFilter.operator)
                        && constraintFilterOperatorValue !== '' && angular.isArray(constraintFilter.values)
                        && constraintFilter.values.length > 0) {
                        var constraintParamPart = {};
                        constraintParamPart["fc" + counter] = constraintFilter.field.sysname;
                        constraintParamPart["fo" + counter] = constraintFilterOperatorValue;
                        var constraintOperatorType = _this.getFieldFilterOperatorValueType(constraintFilter.operator);
                        if (constraintOperatorType === 'twoValues') {
                            constraintParamPart["fvl" + counter] = constraintFilter.values[0];
                            constraintParamPart["fvr" + counter] = constraintFilter.values[1];
                        }
                        else if (constraintOperatorType === 'twoDates') {
                            constraintParamPart["fvl" + counter] = moment(constraintFilter.values[0]).format(_this.$izendaSettingsService.getDateFormat().shortDate);
                            constraintParamPart["fvr" + counter] = moment(constraintFilter.values[1]).format(_this.$izendaSettingsService.getDateFormat().shortDate);
                        }
                        else if (constraintOperatorType === 'oneDate') {
                            constraintParamPart["fvl" + counter] = moment(constraintFilter.values[0]).format(_this.$izendaSettingsService.getDateFormat().shortDate);
                        }
                        else if (constraintOperatorType === 'field') {
                            var val = angular.isObject(constraintFilter.values[0])
                                ? constraintFilter.values[0].sysname
                                : '';
                            constraintParamPart["fvl" + counter] = val;
                        }
                        else {
                            constraintParamPart["fvl" + counter] = constraintFilter.values.join(',');
                        }
                        angular.extend(queryParams, constraintParamPart);
                        counter++;
                    }
                });
            if (simpleJoins) {
                // create tablenames
                var tableNames = tables.map(function (x) { return x.sysname; });
                queryParams['tbl0'] = tableNames.join('\'');
                if (angular.isString(filterLogic) && filterLogic.trim() !== '') {
                    queryParams['filterLogic'] = filterLogic;
                }
                // run query
                return this.$izendaRsQueryService.rsQuery(queryParams, {
                    'dataType': 'json',
                    cache: true
                }, {
                    handler: function (tablesParam, fieldParam) { return "Failed to existent values list list for tables " + tablesParam + " and field " + fieldParam; },
                    params: [tableNames.join(','), filter.field.sysname]
                });
            }
            else {
                // Custom joins request:
                /*
                cmd:GetOptionsByPath
                p:ExistentValuesList
                columnName:[dbo].[Categories].[CategoryID]
                tbl0:[dbo].[Categories]
                ta0:
                tbl1:[dbo].[Invoices]
                ta1:
                lclm1:[dbo].[Invoices].[OrderID]
                rclm1:[dbo].[Categories].[CategoryID]
                jn1:INNER
                */
                throw 'Custom joins hasn\'t implemented yet';
            }
        };
        Object.defineProperty(IzendaInstantReportQueryService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaInstantReportQueryService.register = function (module) {
            module.service('$izendaInstantReportQueryService', IzendaInstantReportQueryService.injectModules.concat(IzendaInstantReportQueryService));
        };
        return IzendaInstantReportQueryService;
    }());
    exports.default = IzendaInstantReportQueryService;
});
izendaRequire.define("instant-report/models/instant-report-pivot-config", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaInstantReportDefaultPivotConfig = /** @class */ (function () {
        function IzendaInstantReportDefaultPivotConfig() {
            this.pivotColumn = null;
            this.cellValues = [];
            this.options = {
                addSideTotals: false
            };
        }
        IzendaInstantReportDefaultPivotConfig.fromObject = function (object) {
            var result = new IzendaInstantReportDefaultPivotConfig();
            result.pivotColumn = object.pivotColumn;
            result.cellValues = object.cellValues;
            result.options = {
                addSideTotals: object.options.addSideTotals
            };
            return result;
        };
        IzendaInstantReportDefaultPivotConfig.prototype.clone = function () {
            var result = new IzendaInstantReportDefaultPivotConfig();
            result.pivotColumn = this.pivotColumn;
            result.cellValues = new Array(this.cellValues);
            result.options = { addSideTotals: this.options ? this.options.addSideTotals : false };
            return result;
        };
        return IzendaInstantReportDefaultPivotConfig;
    }());
    exports.default = IzendaInstantReportDefaultPivotConfig;
});
izendaRequire.define("instant-report/services/instant-report-pivot", ["require", "exports", "angular", "instant-report/models/instant-report-pivot-config", "izenda-external-libs"], function (require, exports, angular, instant_report_pivot_config_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Pivot storage service
     */
    var IzendaInstantReportPivotService = /** @class */ (function () {
        function IzendaInstantReportPivotService($injector, $q, $izendaUtilService) {
            this.$injector = $injector;
            this.$q = $q;
            this.$izendaUtilService = $izendaUtilService;
            var defaultConfig = this.$injector.get(IzendaInstantReportPivotService.$izendaInstantReportPivotsDefaultConfigName);
            this.pivotConfig = instant_report_pivot_config_1.default.fromObject(defaultConfig);
            this.pivotsPanelOpened = false;
        }
        Object.defineProperty(IzendaInstantReportPivotService, "injectModules", {
            get: function () {
                return ['$injector', '$q', '$izendaUtilService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Get pivot column field wrapper
         */
        IzendaInstantReportPivotService.prototype.getPivotColumn = function () {
            return this.pivotConfig.pivotColumn;
        };
        /**
         * Set pivot column
         */
        IzendaInstantReportPivotService.prototype.setPivotColumn = function (value) {
            this.pivotConfig.pivotColumn = value;
        };
        /**
         * Set default group for pivot column.
         */
        IzendaInstantReportPivotService.prototype.setDefaultGroup = function () {
            if (!angular.isObject(this.pivotConfig.pivotColumn))
                return;
            if (!this.pivotConfig.pivotColumn.groupByFunction)
                this.pivotConfig.pivotColumn.groupByFunction = this.$izendaUtilService.getOptionByValue(this.pivotConfig.pivotColumn.groupByFunctionOptions, 'GROUP', true);
        };
        /**
         * Clear pivots
         */
        IzendaInstantReportPivotService.prototype.removePivots = function () {
            this.pivotConfig.pivotColumn = null;
            this.pivotConfig.cellValues = [];
            this.pivotConfig.options.addSideTotals = false;
        };
        /**
         * Get pivot options object
         */
        IzendaInstantReportPivotService.prototype.getPivotOptions = function () {
            return this.pivotConfig.options;
        };
        /**
         * Get pivots panel state
         */
        IzendaInstantReportPivotService.prototype.getPivotsPanelOpened = function () {
            return this.pivotsPanelOpened;
        };
        /**
         * Set pivots panel state
         */
        IzendaInstantReportPivotService.prototype.setPivotsPanelOpened = function (value) {
            this.pivotsPanelOpened = value;
        };
        /////////////////////////////////////////
        // cell value functions
        /////////////////////////////////////////
        /**
         * Get pivot fields wrappers
         */
        IzendaInstantReportPivotService.prototype.getCellValues = function () {
            return this.pivotConfig.cellValues;
        };
        /**
         * Check is pivot added and valid.
         * @returns {boolean} is valid
         */
        IzendaInstantReportPivotService.prototype.isPivotValid = function () {
            return angular.isObject(this.pivotConfig.pivotColumn) && this.pivotConfig.cellValues.length > 0;
        };
        /**
         * Add cell value field
         */
        IzendaInstantReportPivotService.prototype.addCellValue = function () {
            this.pivotConfig.cellValues.push(null);
        };
        /**
         * Remove cell value
         */
        IzendaInstantReportPivotService.prototype.removeCellValue = function (cellValue) {
            var cellValues = this.pivotConfig.cellValues;
            var idx = cellValues.indexOf(cellValue);
            if (idx >= 0) {
                cellValues.splice(idx, 1);
            }
        };
        /**
         * Replace cell values by each other
         */
        IzendaInstantReportPivotService.prototype.swapCellValues = function (fromIndex, toIndex) {
            var cellValues = this.pivotConfig.cellValues;
            var temp = cellValues[fromIndex];
            cellValues[fromIndex] = cellValues[toIndex];
            cellValues[toIndex] = temp;
        };
        /**
         * Move cell value to position
         */
        IzendaInstantReportPivotService.prototype.moveCellValueTo = function (fromIndex, toIndex) {
            var cellValues = this.pivotConfig.cellValues;
            cellValues.splice(toIndex, 0, cellValues.splice(fromIndex, 1)[0]);
        };
        /**
         * Set cell value field, update available groups, formats, etc...
         */
        IzendaInstantReportPivotService.prototype.setCellValueField = function (index, newField) {
            this.pivotConfig.cellValues[index] = newField;
        };
        /**
         * Add pivot column or cell if pivot column already defined
         */
        IzendaInstantReportPivotService.prototype.addPivotItem = function (fieldCopy) {
            if (!angular.isObject(this.pivotConfig.pivotColumn)) {
                this.pivotConfig.pivotColumn = fieldCopy;
            }
            else {
                this.pivotConfig.cellValues.push(fieldCopy);
            }
        };
        /**
         * Synchronizes pivot
         */
        IzendaInstantReportPivotService.prototype.syncPivotState = function (activeFieldsInActiveTables) {
            this.removeNotActiveFields(activeFieldsInActiveTables);
        };
        /**
         * Remove pivot column and pivot cell if corresponging fields are no
         * longer available.
         * @param {array} array of currently active fields.
         */
        IzendaInstantReportPivotService.prototype.removeNotActiveFields = function (activeFieldsInActiveTables) {
            var isFieldInList = function (field, fieldList) { return fieldList && fieldList.some(function (f) { return f.sysname === field.sysname; }); };
            if (this.pivotConfig.pivotColumn && !isFieldInList(this.pivotConfig.pivotColumn, activeFieldsInActiveTables))
                this.pivotConfig.pivotColumn = null;
            this.pivotConfig.cellValues = this.pivotConfig.cellValues.filter(function (cv) { return isFieldInList(cv, activeFieldsInActiveTables); });
        };
        /////////////////////////////////////////
        // data
        /////////////////////////////////////////
        /**
         * Prepare pivots for send
         */
        IzendaInstantReportPivotService.prototype.getPivotDataForSend = function () {
            return this.pivotConfig.pivotColumn ? this.pivotConfig : null;
        };
        /**
         * Load pivot
         */
        IzendaInstantReportPivotService.prototype.loadPivotData = function (pivotData) {
            this.pivotConfig = pivotData;
            return this.$q(function (resolve) { return resolve(); });
        };
        Object.defineProperty(IzendaInstantReportPivotService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaInstantReportPivotService.register = function (module) {
            module
                .value(IzendaInstantReportPivotService.$izendaInstantReportPivotsDefaultConfigName, {
                pivotColumn: null,
                cellValues: [],
                options: {
                    addSideTotals: false
                }
            })
                .service('$izendaInstantReportPivotService', IzendaInstantReportPivotService.injectModules.concat(IzendaInstantReportPivotService));
        };
        IzendaInstantReportPivotService.$izendaInstantReportPivotsDefaultConfigName = '$izendaInstantReportPivotsDefaultConfig';
        return IzendaInstantReportPivotService;
    }());
    exports.default = IzendaInstantReportPivotService;
});
izendaRequire.define("instant-report/services/instant-report-settings", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report settings service.
     */
    var IzendaInstantReportSettingsService = /** @class */ (function () {
        function IzendaInstantReportSettingsService($injector, $izendaRsQueryService) {
            var _this = this;
            this.$injector = $injector;
            this.$izendaRsQueryService = $izendaRsQueryService;
            this.settingsObject = null;
            // first try to get settings object if it have been already loaded
            this.settingsObject = this.$injector.get('$izendaInstantReportSettingsValue');
            if (!angular.isObject(this.settingsObject))
                // if not loaded - load now.
                this.loadInstantReportSettings().then(function (resultObject) {
                    _this.settingsObject = resultObject;
                });
        }
        Object.defineProperty(IzendaInstantReportSettingsService, "injectModules", {
            get: function () {
                return ['$injector', '$izendaRsQueryService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Get instant report settings from server.
         */
        IzendaInstantReportSettingsService.prototype.loadInstantReportSettings = function () {
            return this.$izendaRsQueryService.query('getInstantReportSettings', [], {
                dataType: 'json',
                cache: true
            }, {
                handler: function () { return 'Failed to get instant report settings'; },
                params: []
            });
        };
        /**
         * Settings getter
         */
        IzendaInstantReportSettingsService.prototype.getSettings = function () {
            return this.settingsObject;
        };
        Object.defineProperty(IzendaInstantReportSettingsService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaInstantReportSettingsService.register = function (module) {
            module.service('$izendaInstantReportSettingsService', IzendaInstantReportSettingsService.injectModules.concat(IzendaInstantReportSettingsService));
        };
        return IzendaInstantReportSettingsService;
    }());
    exports.default = IzendaInstantReportSettingsService;
});
izendaRequire.define("instant-report/services/instant-report-visualization", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report chart service. Contains charts data and its functions.
     */
    var IzendaInstantReportVisualizationService = /** @class */ (function () {
        function IzendaInstantReportVisualizationService($q, $izendaInstantReportQueryService) {
            this.$q = $q;
            this.$izendaInstantReportQueryService = $izendaInstantReportQueryService;
            this.visConfig = this.createDefaultConfig();
        }
        Object.defineProperty(IzendaInstantReportVisualizationService, "injectModules", {
            get: function () {
                return ['$q', '$izendaInstantReportQueryService'];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Create default config object
         */
        IzendaInstantReportVisualizationService.prototype.createDefaultConfig = function () {
            return {
                categories: []
            };
        };
        /**
         * Get current config.
         */
        IzendaInstantReportVisualizationService.prototype.getVisualizationConfig = function () {
            return this.visConfig;
        };
        /**
         * Load visualizations. Designed as async operation for future async config loading.
         * @returns {promise object}.
         */
        IzendaInstantReportVisualizationService.prototype.loadVisualizations = function () {
            var _this = this;
            this.visConfig = this.createDefaultConfig();
            return this.$q(function (resolve) {
                // run query:
                _this.$izendaInstantReportQueryService.getVisualizationConfig().then(function (config) {
                    if (!angular.isObject(config) || !angular.isArray(config.categories)) {
                        resolve();
                        return;
                    }
                    // set config:
                    _this.visConfig = config;
                    // add category name to each visualization object:
                    _this.visConfig.categories
                        .filter(function (c) { return !!c.charts; })
                        .forEach(function (c) { return c.charts.forEach(function (chart) { return chart.categoryName = c.name; }); });
                    resolve();
                });
            });
        };
        /**
         * Find visualization object by given name and category.
         * @param {string} category.
         * @param {string} name.
         * @returns {object} visualization object.
         */
        IzendaInstantReportVisualizationService.prototype.findVisualization = function (category, name) {
            var result = null;
            this.visConfig.categories
                .filter(function (c) { return c.name === category; })
                .forEach(function (c) {
                var charts = c.charts.filter(function (ch) { return ch.name === name; });
                if (charts && charts.length)
                    result = charts[0];
            });
            return result;
        };
        Object.defineProperty(IzendaInstantReportVisualizationService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaInstantReportVisualizationService.register = function (module) {
            module.service('$izendaInstantReportVisualizationService', IzendaInstantReportVisualizationService.injectModules.concat(IzendaInstantReportVisualizationService));
        };
        return IzendaInstantReportVisualizationService;
    }());
    exports.default = IzendaInstantReportVisualizationService;
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
izendaRequire.define("instant-report/services/instant-report-storage", ["require", "exports", "angular", "izenda-external-libs", "common/core/tools/izenda-linq"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaInstantReportStorageService = /** @class */ (function () {
        function IzendaInstantReportStorageService($injector, $window, $q, $log, $rootScope, $izendaUtilUiService, $izendaUtilService, $izendaUrlService, $izendaLocaleService, $izendaSettingsService, $izendaCompatibilityService, $izendaScheduleService, $izendaShareService, $izendaInstantReportSettingsService, $izendaInstantReportQueryService, $izendaInstantReportPivotService, $izendaInstantReportVisualizationService) {
            this.$injector = $injector;
            this.$window = $window;
            this.$q = $q;
            this.$log = $log;
            this.$rootScope = $rootScope;
            this.$izendaUtilUiService = $izendaUtilUiService;
            this.$izendaUtilService = $izendaUtilService;
            this.$izendaUrlService = $izendaUrlService;
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaSettingsService = $izendaSettingsService;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.$izendaScheduleService = $izendaScheduleService;
            this.$izendaShareService = $izendaShareService;
            this.$izendaInstantReportSettingsService = $izendaInstantReportSettingsService;
            this.$izendaInstantReportQueryService = $izendaInstantReportQueryService;
            this.$izendaInstantReportPivotService = $izendaInstantReportPivotService;
            this.$izendaInstantReportVisualizationService = $izendaInstantReportVisualizationService;
            // const:
            this.emptyFieldGroupOption = $injector.get('izendaDefaultFunctionObject');
            this.emptySubtotalFieldGroupOptions = $injector.get('izendaDefaultSubtotalFunctionObject');
            this.emptyExpressionType = {
                value: '...',
                text: '...'
            };
            this.emptyFieldFormatOption = $injector.get('izendaDefaultFormatObject');
            this.isPageInitialized = false;
            this.isPageReady = false;
            this.existingReportLoadingSchedule = null;
            this.newReportLoadingSchedule = null;
            this.isPreviewSplashVisible = false;
            this.previewSplashText = $izendaLocaleService.localeText('js_WaitPreviewLoading', 'Please wait while preview is loading...');
            this.reportSet = angular.merge({}, $injector.get('izendaInstantReportObjectDefaults'));
            this.reportSet.options.distinct = $izendaInstantReportSettingsService.getSettings().distinct; // set default distinct setting value
            this.restoreDefaultColors(); // set default report colors
            this.activeTables = [];
            this.activeFields = [];
            this.calcFields = [];
            this.activeCheckedFields = [];
            this.constraints = [];
            this.vgStyles = null;
            this.drillDownStyles = null;
            this.expressionTypes = null;
            this.subreports = null;
            this.currentActiveField = null;
            this.uiPanelsState = {
                filtersPanelOpened: false
            };
            this.nextId = 1;
            this.orderCounter = 1;
            this.previewHtml = '';
            this.initialize();
        }
        Object.defineProperty(IzendaInstantReportStorageService, "injectModules", {
            get: function () {
                return [
                    '$injector',
                    '$window',
                    '$q',
                    '$log',
                    '$rootScope',
                    '$izendaUtilUiService',
                    '$izendaUtilService',
                    '$izendaUrlService',
                    '$izendaLocaleService',
                    '$izendaSettingsService',
                    '$izendaCompatibilityService',
                    '$izendaScheduleService',
                    '$izendaShareService',
                    '$izendaInstantReportSettingsService',
                    '$izendaInstantReportQueryService',
                    '$izendaInstantReportPivotService',
                    '$izendaInstantReportVisualizationService'
                ];
            },
            enumerable: true,
            configurable: true
        });
        IzendaInstantReportStorageService.prototype.initialize = function () {
            var _this = this;
            // initialize:
            this.$log.debug('Start instant report initialize');
            this.isPageInitialized = false;
            this.isPageReady = false;
            var startInitializingTimestamp = (new Date()).getTime();
            this.$q.all([this.loadDataSources(), this.initializeVgStyles(), this.initializeSubreports(), this.initializeDrillDownStyles(),
                this.initializeExpressionTypes(), this.$izendaInstantReportVisualizationService.loadVisualizations()]).then(function () {
                _this.isPageInitialized = true;
                if (angular.isString(_this.existingReportLoadingSchedule)) {
                    // existing report
                    _this.$log.debug('Start loading scheduled report', _this.existingReportLoadingSchedule);
                    _this.loadReport(_this.existingReportLoadingSchedule).then(function () {
                        _this.$log.debug('End loading scheduled report');
                        _this.existingReportLoadingSchedule = null;
                        _this.isPageReady = true;
                        _this.$rootScope.$applyAsync();
                        _this.$log.debug('Page ready: ', (new Date()).getTime() - startInitializingTimestamp + "ms");
                    });
                }
                else if (angular.isString(_this.newReportLoadingSchedule)) {
                    // new report
                    _this.$log.debug('Start creating new report');
                    _this.newReport().then(function () {
                        _this.$log.debug('End creating new report');
                        _this.newReportLoadingSchedule = null;
                        _this.isPageReady = true;
                        _this.$rootScope.$applyAsync();
                        _this.$log.debug('Page ready: ', (new Date()).getTime() - startInitializingTimestamp + "ms");
                    });
                }
                else {
                    // default
                    _this.isPageReady = true;
                    _this.$log.debug('Page ready: ', (new Date()).getTime() - startInitializingTimestamp + "ms");
                }
            });
        };
        /////////////////////////////////////////
        // common functions
        /////////////////////////////////////////
        /**
         * Get type group of field operator
         */
        IzendaInstantReportStorageService.prototype.getFieldFilterOperatorValueType = function (operator) {
            return this.$izendaInstantReportQueryService.getFieldFilterOperatorValueType(operator);
        };
        IzendaInstantReportStorageService.prototype.getReportSetFullName = function () {
            var category = this.reportSet.reportCategory;
            var name = this.reportSet.reportName;
            if (!angular.isString(name) || name.trim() === '')
                return null;
            var result = '';
            if (!this.$izendaUtilService.isUncategorized(category)) {
                result += category + this.$izendaSettingsService.getCategoryCharacter();
            }
            result += name;
            return result;
        };
        IzendaInstantReportStorageService.prototype.getNextId = function () {
            return this.nextId++;
        };
        IzendaInstantReportStorageService.prototype.guid = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
        IzendaInstantReportStorageService.prototype.getNextOrder = function () {
            return this.orderCounter++;
        };
        /**
         * Becomes true when page is ready to work
         */
        IzendaInstantReportStorageService.prototype.getPageReady = function () {
            return this.isPageReady;
        };
        /**
         * Get whole report set
         */
        IzendaInstantReportStorageService.prototype.getReportSet = function () {
            return this.reportSet;
        };
        /**
         * Get datasources
         */
        IzendaInstantReportStorageService.prototype.getDataSources = function () {
            return this.reportSet.dataSources;
        };
        /**
         * Set datasources
         */
        IzendaInstantReportStorageService.prototype.setDataSources = function (dataSources) {
            if (!angular.isArray(dataSources))
                throw '"dataSources" parameter should be array.';
            this.reportSet.dataSources = dataSources;
        };
        /**
         * Get filters reference
         */
        IzendaInstantReportStorageService.prototype.getFilters = function () {
            return this.reportSet.filters;
        };
        /**
         * Get report set options
         */
        IzendaInstantReportStorageService.prototype.getOptions = function () {
            return this.reportSet.options;
        };
        /**
         * Get drilldown fields
         */
        IzendaInstantReportStorageService.prototype.getDrillDownFields = function () {
            return this.reportSet.drillDownFields;
        };
        /**
         * Get filter options
         */
        IzendaInstantReportStorageService.prototype.getFilterOptions = function () {
            return this.reportSet.filterOptions;
        };
        /**
         * Get preview html
         */
        IzendaInstantReportStorageService.prototype.getPreview = function () {
            return this.previewHtml;
        };
        /**
         * Parse and set constraints
         */
        IzendaInstantReportStorageService.prototype.setConstraints = function (constraintsData) {
            this.constraints = constraintsData.Data;
        };
        /**
         * Find category by given id
         */
        IzendaInstantReportStorageService.prototype.getCategoryById = function (id) {
            var i = 0;
            var datasources = this.getDataSources();
            while (i < datasources.length) {
                var datasource = datasources[i];
                if (datasource.id === id)
                    return datasource;
                i++;
            }
            return null;
        };
        /**
         * Find first table by property value.
         */
        IzendaInstantReportStorageService.prototype.getTableByProperty = function (propertyName, value, caseIndependent) {
            if (angular.isUndefined(propertyName))
                throw 'propertyName parameter should be set.';
            var datasources = this.getDataSources();
            for (var i = 0; i < datasources.length; i++) {
                var category = datasources[i];
                for (var j = 0; j < category.tables.length; j++) {
                    var table = category.tables[j];
                    if (!table.hasOwnProperty(propertyName))
                        throw 'Table don\'t have property ' + propertyName;
                    var propertyValue = table[propertyName];
                    var compareValue = value;
                    if (propertyValue && caseIndependent)
                        propertyValue = (propertyValue + '').toLowerCase();
                    if (compareValue && caseIndependent)
                        compareValue = (compareValue + '').toLowerCase();
                    if (propertyValue === compareValue)
                        return table;
                }
            }
            return null;
        };
        /**
         * Find table by given id
         */
        IzendaInstantReportStorageService.prototype.getTableById = function (id) {
            return this.getTableByProperty('id', id);
        };
        /**
         * Find table by given sysname
         * @param {string} sysname.
         * @returns {object} table object.
         */
        IzendaInstantReportStorageService.prototype.getTableBySysname = function (sysname) {
            return this.getTableByProperty('sysname', sysname);
        };
        /**
         * Find table by name. (Case independent)
         * @param {string} name.
         * @returns {object} table object.
         */
        IzendaInstantReportStorageService.prototype.getTableByName = function (name) {
            return this.getTableByProperty('name', name, true);
        };
        /**
         * Find field by given id
         */
        IzendaInstantReportStorageService.prototype.getFieldById = function (id) {
            var i = 0;
            var datasources = this.getDataSources();
            while (i < datasources.length) {
                var j = 0;
                var tables = datasources[i].tables;
                while (j < tables.length) {
                    var k = 0;
                    var fields = tables[j].fields;
                    while (k < fields.length) {
                        var field = fields[k];
                        if (field.id === id) {
                            return field;
                        }
                        if (field.isMultipleColumns && field.multipleColumns.length) {
                            var multipleField = field.multipleColumns.firstOrDefault(function (f) { return f.id === id; });
                            if (multipleField)
                                return multipleField;
                        }
                        k++;
                    }
                    j++;
                }
                i++;
            }
            return null;
        };
        /**
         * Get all tables in all datasources
         */
        IzendaInstantReportStorageService.prototype.getAllTables = function () {
            return this.getDataSources().reduce(function (result, category) { return result.concat(category.tables); }, []);
        };
        /**
        * Get checked tables
        */
        IzendaInstantReportStorageService.prototype.getActiveTables = function () {
            return this.activeTables;
        };
        /**
         * Find field by guid
         */
        IzendaInstantReportStorageService.prototype.getCalcField = function (calcFieldId) {
            return this.calcFields.firstOrDefault(function (c) { return c.sysname === calcFieldId; });
        };
        IzendaInstantReportStorageService.prototype.getField = function (propertyName, propertyValue, findInAllTables) {
            if (propertyValue && propertyValue.indexOf('fldId|') === 0)
                return this.getCalcField(propertyValue);
            var tablesCollection = (typeof (findInAllTables) === 'boolean' && findInAllTables)
                ? this.getAllTables()
                : this.getActiveTables();
            // find first field in tables which matches predicate "propertyName = propertyValue":
            return tablesCollection.firstOrDefaultInInner('fields', function (f) {
                return f.hasOwnProperty(propertyName) && f[propertyName] === propertyValue;
            });
        };
        /**
         * Find field by sysname
         */
        IzendaInstantReportStorageService.prototype.getFieldBySysName = function (sysname, findInAllTables) {
            return this.getField('sysname', sysname, findInAllTables);
        };
        /**
         * Check if functions allowed to field
         */
        IzendaInstantReportStorageService.prototype.isBinaryField = function (field) {
            if (!field)
                return false;
            var expressionType = field.expressionType;
            if (expressionType && expressionType.value && expressionType.value !== '...')
                return ['Binary', 'Other', 'None'].indexOf(expressionType.value) >= 0;
            return field.sqlType === 'Text' || field.sqlType === 'Image';
        };
        /**
         * Get checked and not checked fields in active tables;
         * TODO: it is not a good idea to assign values to "additionalGroup" property in get function.
         */
        IzendaInstantReportStorageService.prototype.getAllFieldsInActiveTables = function (appendCalcFields) {
            var _this = this;
            this.activeFields.forEach(function (f) {
                return f.additionalGroup = f.tableName;
            });
            if (!appendCalcFields)
                return this.activeFields;
            this.calcFields.forEach(function (f) {
                return f.additionalGroup = _this.$izendaLocaleService.localeText('js_calcFields', 'Calculated Fields');
            });
            return this.activeFields.concat(this.calcFields);
        };
        /**
         * Get active (checked) fields (including multiple fields).
         * @param {object} table Table object.
         * @returns {object[]} Checked fields collection.
         */
        IzendaInstantReportStorageService.prototype.getActiveFields = function (table) {
            return table.fields.reduce(function (result, f) {
                if (!f.isMultipleColumns && f.checked)
                    result.push(f);
                else if (f.isMultipleColumns)
                    result = result.concat(f.multipleColumns.filter(function (fm) { return fm.checked; }));
                return result;
            }, []);
        };
        /**
         * Base fields iterator function
         * @param {function} fieldHandler iterator "each" handler
         * @param {function} getFieldsFunction field filter function (function(table) {... return fieldsArray; })
         * @param {object} context context object
         */
        IzendaInstantReportStorageService.prototype.eachFieldsBase = function (fieldHandler, getFieldsFunction, context) {
            var _this = this;
            if (!angular.isFunction(fieldHandler))
                throw 'fieldHandler should be a function.';
            this.getActiveTables().forEach(function (t) {
                var aFields = getFieldsFunction(t);
                if (aFields && aFields.length)
                    aFields.forEach(function (f) { return fieldHandler.call(angular.isDefined(context) ? context : _this, f, t); });
            });
        };
        /**
         * Works like each. Iterate through checked fields
         */
        IzendaInstantReportStorageService.prototype.eachActiveFields = function (fieldHandler, context) {
            this.eachFieldsBase(fieldHandler, this.getActiveFields, context);
        };
        /**
         * Get all checked fields.
         */
        IzendaInstantReportStorageService.prototype.getAllActiveFields = function () {
            var result = [];
            this.eachActiveFields(function (field) { return result.push(field); });
            return result;
        };
        /**
         * Get all checked and visible fields.
         */
        IzendaInstantReportStorageService.prototype.getAllVisibleFields = function () {
            return this.getAllActiveFields().filter(function (f) { return f.visible; });
        };
        /////////////////////////////////////////
        // group functions
        /////////////////////////////////////////
        /**
         * Check if functions allowed to field
         */
        IzendaInstantReportStorageService.prototype.isActiveFieldsContainsBinary = function () {
            var _this = this;
            return this.getAllActiveFields().some(function (f) { return _this.isBinaryField(f); });
        };
        /////////////////////////////////////////
        // group functions
        /////////////////////////////////////////
        /**
         * Check if field grouped
         */
        IzendaInstantReportStorageService.prototype.isFieldGrouped = function (field) {
            var compareWithValue = this.emptyFieldGroupOption.value;
            if (!field.groupByFunction || !field.groupByFunction.value)
                return false;
            return field.groupByFunction.value.toLowerCase() !== compareWithValue.toLowerCase();
        };
        /**
         * Check if field grouped and not 'group' function is applied.
         */
        IzendaInstantReportStorageService.prototype.isFieldGroupedWithFunction = function (field) {
            return this.isFieldGrouped(field) && field.groupByFunction.value.toLowerCase() !== 'group';
        };
        /**
         * Update field formats (it depends on selected group function)
         */
        IzendaInstantReportStorageService.prototype.updateFieldFormats = function (field, defaultFormatString) {
            var _this = this;
            var gotFieldFormats = function (returnObj, defaultTypeGroup, resolveFunc) {
                field.formatOptionGroups = _this.$izendaUtilService.convertOptionsByPath(returnObj);
                var formatToApply;
                var defaultTypeGroupFormatString = _this.getDefaultFieldFormat(defaultTypeGroup);
                if (angular.isString(defaultFormatString) && defaultFormatString) {
                    formatToApply = _this.$izendaUtilService.getOptionByValue(field.formatOptionGroups, defaultFormatString);
                    if (!formatToApply) {
                        formatToApply =
                            _this.$izendaUtilService.getOptionByValue(field.formatOptionGroups, defaultTypeGroupFormatString);
                    }
                }
                else {
                    formatToApply =
                        _this.$izendaUtilService.getOptionByValue(field.formatOptionGroups, defaultTypeGroupFormatString);
                }
                field.format = formatToApply;
                resolveFunc(field);
            };
            return this.$q(function (resolve) {
                // isFieldGrouped guarantees that field.groupByFunction.value will be non-empty and don't have "None" value.
                if (_this.isFieldGrouped(field) && ['min', 'max', 'sum', 'sum_distinct', 'group'].indexOf(field.groupByFunction.value.toLowerCase()) < 0) {
                    _this.$izendaInstantReportQueryService.getFieldFormats(field, field.groupByFunction.dataTypeGroup).then(function (returnObj) {
                        gotFieldFormats(returnObj, field.groupByFunction.dataTypeGroup, resolve);
                    });
                }
                else {
                    _this.$izendaInstantReportQueryService.getFieldFormats(field).then(function (returnObj) {
                        gotFieldFormats(returnObj, field.typeGroup, resolve);
                    });
                }
            });
        };
        /**
         * Get group by given value
         */
        IzendaInstantReportStorageService.prototype.getGroupByValue = function (field, value) {
            return this.$izendaUtilService.getOptionByValue(field.groupByFunctionOptions, value, true);
        };
        /**
         * Get Subtotal group by given value
         */
        IzendaInstantReportStorageService.prototype.getGroupBySubtotalValue = function (field, value) {
            return this.$izendaUtilService.getOptionByValue(field.groupBySubtotalFunctionOptions, value, true);
        };
        /**
         * Check if checked fields has function
         */
        IzendaInstantReportStorageService.prototype.isReportUseGroup = function () {
            var _this = this;
            var activeTables = this.getActiveTables();
            if (activeTables.length === 0)
                return false;
            var result = false;
            this.eachActiveFields(function (field) {
                if (_this.isFieldGrouped(field))
                    result = true;
            });
            return result;
        };
        /**
         * Reset all groups which was grouped automatically.
         */
        IzendaInstantReportStorageService.prototype.resetAutoGroups = function () {
            var _this = this;
            // check group function:
            this.eachActiveFields(function (field) {
                if (!_this.isBinaryField(field)) {
                    field.groupByFunction = _this.getGroupByValue(field, 'NONE');
                    _this.updateFieldFormats(field);
                }
            });
        };
        /**
         * Check if report has group and apply group by for other columns.
         */
        IzendaInstantReportStorageService.prototype.applyAutoGroups = function (force) {
            var _this = this;
            if (!force) {
                var hasGroup = this.isReportUseGroup();
                if (!hasGroup)
                    return;
            }
            // check group function:
            this.eachActiveFields(function (field) {
                if (_this.isBinaryField(field))
                    return;
                if (!_this.isFieldGrouped(field)) {
                    field.groupByFunction = _this.getGroupByValue(field, 'GROUP');
                    _this.updateFieldFormats(field);
                }
            });
        };
        /**
         * Get possible visual group styles from server
         */
        IzendaInstantReportStorageService.prototype.initializeVgStyles = function () {
            var _this = this;
            return this.$q(function (resolve) {
                _this.$izendaInstantReportQueryService.getVgStyles().then(function (result) {
                    _this.vgStyles = result[0].options;
                    resolve();
                });
            });
        };
        /**
         * Get visual group styles
         */
        IzendaInstantReportStorageService.prototype.getVgStyles = function () {
            return this.vgStyles;
        };
        /**
         * Initialize possible expression types.
         */
        IzendaInstantReportStorageService.prototype.initializeExpressionTypes = function () {
            var _this = this;
            return this.$q(function (resolve) {
                _this.$izendaInstantReportQueryService.getExpressionTypes().then(function (result) {
                    _this.expressionTypes = [];
                    var options = result[0].options;
                    if (options)
                        _this.expressionTypes = _this.expressionTypes.concat(options.filter(function (o) { return o.value !== ''; }));
                    resolve();
                });
            });
        };
        /**
         * Initialize possible drilldown styles from server
         */
        IzendaInstantReportStorageService.prototype.initializeDrillDownStyles = function () {
            var _this = this;
            return this.$q(function (resolve) {
                _this.$izendaInstantReportQueryService.getDrillDownStyles().then(function (result) {
                    _this.drillDownStyles = [];
                    var options = result[0].options;
                    if (options)
                        options.forEach(function (o) {
                            o.disabled = false;
                            _this.drillDownStyles.push(o);
                        });
                    resolve();
                });
            });
        };
        /**
         * Disable EmbeddedDetail drilldown style for current report and (AUTO)
         */
        IzendaInstantReportStorageService.prototype.disableEmbeddedDrillDownStyle = function (field) {
            var _this = this;
            this.drillDownStyles.forEach(function (ddStyle) {
                ddStyle.disabled = false;
                var reportInfo = _this.$izendaUrlService.getReportInfo();
                if (ddStyle.value === 'EmbeddedDetail') {
                    ddStyle.disabled = field.subreport === '(AUTO)' || field.subreport === reportInfo.fullName;
                }
            });
        };
        /**
         * Get drilldown styles
         */
        IzendaInstantReportStorageService.prototype.getDrillDownStyles = function () {
            return this.drillDownStyles;
        };
        IzendaInstantReportStorageService.prototype.getExpressionTypes = function () {
            return this.expressionTypes;
        };
        IzendaInstantReportStorageService.prototype.initializeSubreports = function () {
            var _this = this;
            return this.$q(function (resolve) {
                _this.$izendaInstantReportQueryService.getSubreports().then(function (result) {
                    _this.subreports = result[0].options;
                    resolve();
                });
            });
        };
        IzendaInstantReportStorageService.prototype.getSubreports = function () {
            return this.subreports;
        };
        /////////////////////////////////////////
        // validation functions
        /////////////////////////////////////////
        /**
         * Remove all validation messages
         */
        IzendaInstantReportStorageService.prototype.clearValidation = function () {
            if (!angular.isArray(this.getDataSources()))
                return;
            this.getDataSources().forEach(function (category) {
                category.tables.forEach(function (table) {
                    table.validateMessages = [];
                    table.validateMessageLevel = null;
                    table.fields.forEach(function (field) {
                        field.validateMessages = [];
                        field.validateMessageLevel = null;
                    });
                });
            });
        };
        /**
         * Validate report and set validate messages to tables and fields
         */
        IzendaInstantReportStorageService.prototype.validateReport = function () {
            var _this = this;
            this.clearValidation();
            var validationFailed = false;
            var activeTables = this.getActiveTables();
            if (activeTables.length === 0)
                return false;
            var hasGroup = this.isReportUseGroup();
            this.eachActiveFields(function (field) {
                if (hasGroup && _this.isBinaryField(field)) {
                    // if field have sql type which can't be grouped
                    field.validateMessages.push({
                        messageType: 'danger',
                        message: _this.$izendaLocaleService.localeTextWithParams('js_CantUseWithGroup', 'Can\'t use fields with sql type "{0}" with GROUP BY statement', [field.sqlType])
                    });
                    field.validateMessageLevel = 'danger';
                    validationFailed = true;
                }
                else if (hasGroup && !_this.isFieldGrouped(field)) {
                    // if field have no group function
                    field.validateMessages.push({
                        messageType: 'danger',
                        message: _this.$izendaLocaleService.localeText('js_MustBeFunction', 'If functions are used, each selection must be a function.')
                    });
                    field.validateMessageLevel = 'danger';
                    validationFailed = true;
                }
            });
            return validationFailed;
        };
        /////////////////////////////////////////
        // common UI functions
        /////////////////////////////////////////
        IzendaInstantReportStorageService.prototype.hideAllPanels = function () {
            this.uiPanelsState.filtersPanelOpened = false;
        };
        IzendaInstantReportStorageService.prototype.getFiltersPanelOpened = function () {
            return this.uiPanelsState.filtersPanelOpened;
        };
        IzendaInstantReportStorageService.prototype.setFiltersPanelOpened = function (value) {
            this.hideAllPanels();
            this.uiPanelsState.filtersPanelOpened = value;
        };
        /////////////////////////////////////////
        // datasources functions
        /////////////////////////////////////////
        /**
         * Algorithm which find nodes which can't be deactivated
         */
        IzendaInstantReportStorageService.prototype.findBridgesForGraph = function (nodes, links) {
            var n = nodes.length;
            var used = new Array(n);
            var tin = new Array(n);
            var fup = new Array(n);
            var timer = 0;
            var bridgeNodes = [];
            var getLinksForNode = function (node) {
                var result = [];
                for (var i = 0; i < links.length; i++) {
                    var link = links[i];
                    var link1 = link[0];
                    var link2 = link[1];
                    if (link1 === link2)
                        continue;
                    if (link1 === node && result.indexOf(link2) < 0)
                        result.push(link2);
                    if (link2 === node && result.indexOf(link1) < 0)
                        result.push(link1);
                }
                return result;
            };
            var dfs = function (v, p) {
                used[v] = true;
                tin[v] = fup[v] = timer++;
                var currentLinks = getLinksForNode(nodes[v]);
                for (var i = 0; i < currentLinks.length; i++) {
                    var to = currentLinks[i];
                    if (to === p)
                        continue;
                    if (used[to])
                        fup[v] = Math.min(fup[v], tin[to]);
                    else {
                        dfs(to, v);
                        fup[v] = Math.min(fup[v], fup[to]);
                        if (fup[to] > tin[v]) {
                            var isToNodeEdge = getLinksForNode(to).length < 2;
                            var isVNodeEdge = currentLinks.length < 2;
                            if (!isToNodeEdge && bridgeNodes.indexOf(to) < 0) {
                                bridgeNodes.push(to);
                            }
                            if (!isVNodeEdge && bridgeNodes.indexOf(v) < 0) {
                                bridgeNodes.push(v);
                            }
                        }
                    }
                }
            };
            var findBridges = function () {
                timer = 0;
                for (var ii = 0; ii < n; ii++) {
                    used[ii] = false;
                    tin[ii] = null;
                    fup[ii] = null;
                }
                for (var i = 0; i < n; i++)
                    if (!used[i])
                        dfs(i);
            };
            findBridges();
            return bridgeNodes;
        };
        /**
         * Constraints check and update tables availability.
         */
        IzendaInstantReportStorageService.prototype.updateTablesAvailability = function () {
            var _this = this;
            // create tables which available by foreign keys
            var currentActiveTables = this.getActiveTables();
            var applyConstraints = currentActiveTables.length !== 0;
            var activeTableNames = [];
            var nodeConstraints = [];
            var nodes = [];
            currentActiveTables.forEach(function (table, iTable) {
                nodes.push(iTable);
                activeTableNames.push(table.sysname);
            });
            // process constraints data
            var foreignKeyTables = [];
            this.constraints.forEach(function (constraint) {
                var part1 = constraint[0], part2 = constraint[1];
                var part1Index = activeTableNames.indexOf(part1);
                var part2Index = activeTableNames.indexOf(part2);
                if (part1Index >= 0 && part2Index >= 0 && part1 !== part2) {
                    nodeConstraints.push([part1Index, part2Index]);
                }
                currentActiveTables.forEach(function (table) {
                    if (part1 === table.sysname || part2 === table.sysname) {
                        if (foreignKeyTables.indexOf(part1) < 0)
                            foreignKeyTables.push(part1);
                        if (foreignKeyTables.indexOf(part2) < 0)
                            foreignKeyTables.push(part2);
                    }
                });
            });
            // enable/disable tables
            this.getDataSources().forEach(function (category) {
                category.enabled = false;
                // check tables
                category.tables.forEach(function (table) {
                    if (!applyConstraints) {
                        category.enabled = true;
                        table.enabled = true;
                        table.fields.forEach(function (field) {
                            field.enabled = table.enabled;
                        });
                        return;
                    }
                    table.enabled = table.active
                        || (foreignKeyTables.indexOf(table.sysname) >= 0
                            && _this.$izendaInstantReportSettingsService.getSettings().maxAllowedTables > currentActiveTables.length);
                    category.enabled |= table.enabled;
                    table.fields.forEach(function (field) {
                        field.enabled = table.enabled;
                    });
                });
            });
            // disable bridge tables (tables which are links between two other active tables):
            var result = this.findBridgesForGraph(nodes, nodeConstraints);
            result.forEach(function (idx) { return currentActiveTables[idx].enabled = false; });
        };
        /**
         * Set "selected = false" for all fields
         */
        IzendaInstantReportStorageService.prototype.unselectAllFields = function () {
            this.getDataSources().forEach(function (category) {
                category.tables.forEach(function (table) {
                    table.fields.forEach(function (field) {
                        field.selected = false;
                        field.multipleColumns.forEach(function (mField) { return mField.selected = false; });
                    });
                });
            });
        };
        /**
         * Check is calc field exist
         */
        IzendaInstantReportStorageService.prototype.calcFieldExist = function (calcFieldId) {
            return this.calcFields.some(function (c) { return c.sysname === calcFieldId; });
        };
        /**
         * Update calc field properties
         */
        IzendaInstantReportStorageService.prototype.updateCalcField = function (field, calcField) {
            calcField.name = "[" + field.description + "] (calc)";
        };
        /**
         * Create calc field
         */
        IzendaInstantReportStorageService.prototype.createCalcField = function (field) {
            var result = angular.copy(field);
            result.sysname = "fldId|" + field.guid;
            this.updateCalcField(field, result);
            return result;
        };
        /**
         * Sync calc fields
         */
        IzendaInstantReportStorageService.prototype.syncCalcFieldsArray = function () {
            var _this = this;
            var newCalcFields = [];
            // remove old calc fields
            this.calcFields.forEach(function (calcField) {
                var foundField = null;
                var fieldGuid = calcField.sysname.substring(6);
                _this.eachActiveFields(function (field) {
                    if (fieldGuid === field.guid)
                        foundField = field;
                });
                var isExpressionSet = foundField
                    && angular.isString(foundField.expression)
                    && foundField.expression.trim() !== '';
                if (foundField && (_this.isFieldGroupedWithFunction(foundField) || isExpressionSet)) {
                    newCalcFields.push(calcField);
                    _this.updateCalcField(foundField, calcField);
                }
            });
            this.calcFields = newCalcFields;
            // add new
            this.eachActiveFields(function (field) {
                var isExpressionSet = angular.isString(field.expression)
                    && field.expression.trim() !== '';
                // if field grouped and it is not simple 'GROUP' or it has expression
                if (!_this.calcFieldExist("fldId|" + field.guid) && (_this.isFieldGroupedWithFunction(field) || isExpressionSet)) {
                    var calcField = _this.createCalcField(field);
                    _this.calcFields.push(calcField);
                }
            });
        };
        /**
         * Create active tables array
         */
        IzendaInstantReportStorageService.prototype.syncActiveTablesArray = function () {
            var _this = this;
            this.activeTables = [];
            this.activeFields = [];
            this.activeCheckedFields = [];
            this.getDataSources().forEach(function (category) {
                category.tables.filter(function (t) { return t.active; }).forEach(function (table) {
                    _this.activeTables.push(table);
                    _this.activeFields = _this.activeFields.concat(table.fields);
                    _this.activeCheckedFields = _this.activeCheckedFields.concat(table.fields.filter(function (f) { return f.checked; }));
                });
            });
            this.syncCalcFieldsArray();
        };
        /**
         * Update tree state after checking table
         */
        IzendaInstantReportStorageService.prototype.updateParentFolders = function (table, syncCollapse) {
            var parentCategory = this.getCategoryById(table.parentId);
            this.syncActiveTablesArray();
            // update category active
            parentCategory.active = parentCategory.tables.some(function (t) { return t.active; });
            if (syncCollapse)
                parentCategory.collapsed = !parentCategory.active;
            this.updateTablesAvailability();
        };
        /**
         * Update tree state after checking field
         */
        IzendaInstantReportStorageService.prototype.updateParentFoldersAndTables = function (field, syncCollapse, restrictTableUncheck) {
            var table = this.getTableById(field.parentId);
            var hasCheckedFields = table.fields.some(function (f) { return f.checked; });
            // if table checked state false -> true:
            if (hasCheckedFields && !table.active)
                table.order = this.getNextOrder();
            // update table active
            table.active = restrictTableUncheck || hasCheckedFields || !table.enabled;
            if (syncCollapse)
                table.collapsed = !hasCheckedFields;
            // update table
            this.updateParentFolders(table, syncCollapse);
        };
        /**
         * Update drilldowns
         */
        IzendaInstantReportStorageService.prototype.updateDrilldowns = function () {
            var _this = this;
            this.reportSet.drillDownFields = this.reportSet.drillDownFields.filter(function (drilldownField) {
                return _this.getAllFieldsInActiveTables().some(function (f) { return drilldownField.id === f.id; });
            });
        };
        /**
        * Get filtered datasources
        */
        IzendaInstantReportStorageService.prototype.searchInDataDources = function (searchString, from, to) {
            var _this = this;
            return this.$q(function (resolve) {
                if (searchString === '') {
                    resolve([]);
                    return;
                }
                // start search
                _this.$izendaInstantReportQueryService.findInDatasources(searchString, from, to).then(function (results) {
                    // search completed
                    if (results && results.length)
                        results.forEach(function (item, idx) { return item.id = from + idx; });
                    resolve(results);
                });
            });
        };
        IzendaInstantReportStorageService.prototype.resetFieldObject = function (fieldObject, defaultValues) {
            fieldObject.isInitialized = false;
            fieldObject.isMultipleColumns = false;
            fieldObject.multipleColumns = [];
            fieldObject.highlight = false;
            fieldObject.enabled = true;
            fieldObject.checked = false;
            fieldObject.selected = false;
            fieldObject.collapsed = false;
            fieldObject.isVgUsed = false;
            fieldObject.breakPageAfterVg = false;
            fieldObject.description = this.$izendaUtilService.humanizeVariableName(fieldObject.name);
            fieldObject.isDescriptionSetManually = false;
            fieldObject.order = 0;
            fieldObject.format = this.emptyFieldFormatOption;
            fieldObject.formatOptionGroups = [];
            fieldObject.groupByFunction = this.emptyFieldGroupOption;
            fieldObject.groupByFunctionOptions = [];
            fieldObject.groupBySubtotalFunction = this.emptySubtotalFieldGroupOptions;
            fieldObject.groupBySubtotalFunctionOptions = [];
            fieldObject.subtotalExpression = '';
            fieldObject.allowedInFilters = true;
            fieldObject.isSpParameter = false;
            fieldObject.sort = null;
            fieldObject.italic = false;
            fieldObject.columnGroup = '';
            fieldObject.separator = false;
            fieldObject.textHighlight = '';
            fieldObject.cellHighlight = '';
            fieldObject.valueRange = '';
            fieldObject.width = '';
            fieldObject.labelJustification = 'M';
            fieldObject.valueJustification = ' ';
            fieldObject.visible = true;
            fieldObject.gradient = false;
            fieldObject.bold = false;
            fieldObject.drillDownStyle = '';
            fieldObject.customUrl = '';
            fieldObject.subreport = '';
            fieldObject.expression = '';
            fieldObject.expressionType = this.emptyExpressionType;
            fieldObject.groupByExpression = false;
            fieldObject.validateMessages = [];
            fieldObject.validateMessageLevel = null;
            angular.extend(fieldObject, defaultValues);
        };
        IzendaInstantReportStorageService.prototype.createFieldObjectInner = function (fieldProperties) {
            var fieldObject = {
                id: this.getNextId(),
                parentFieldId: null,
                parentId: null,
                name: null,
                tableSysname: null,
                tableName: null,
                sysname: null,
                typeGroup: null,
                type: null,
                sqlType: null,
                allowedInFilters: null,
                isDescriptionSetManually: null,
                description: null,
                order: 0,
                guid: null,
                selected: null,
                checked: null
            };
            this.resetFieldObject(fieldObject, fieldProperties);
            return fieldObject;
        };
        /**
         * Create field object.
         */
        IzendaInstantReportStorageService.prototype.createFieldObject = function (fieldName, tableId, tableSysname, tableName, fieldSysname, fieldTypeGroup, fieldType, fieldSqlType, allowedInFilters, isSpParameter) {
            var fieldObject = this.createFieldObjectInner({
                guid: this.guid(),
                parentId: tableId,
                name: fieldName,
                tableSysname: tableSysname,
                tableName: tableName,
                sysname: fieldSysname,
                typeGroup: fieldTypeGroup,
                type: fieldType,
                sqlType: fieldSqlType,
                allowedInFilters: allowedInFilters,
                isSpParameter: isSpParameter
            });
            return fieldObject;
        };
        /**
         * Copy field object state
         */
        IzendaInstantReportStorageService.prototype.copyFieldObject = function (from, to, replaceName) {
            to.id = from.id;
            to.guid = from.guid;
            to.isInitialized = from.isInitialized;
            to.parentId = from.parentId;
            to.tableSysname = from.tableSysname;
            if (replaceName)
                to.name = from.name;
            to.sysname = from.sysname;
            to.typeGroup = from.typeGroup;
            to.type = from.type;
            to.sqlType = from.sqlType;
            to.enabled = from.enabled;
            to.expression = from.expression;
            to.expressionType = from.expressionType;
            to.groupByExpression = from.groupByExpression;
            to.checked = from.checked;
            to.isVgUsed = from.isVgUsed;
            to.breakPageAfterVg = from.breakPageAfterVg;
            to.description = from.description;
            to.isDescriptionSetManually = from.isDescriptionSetManually;
            to.order = from.order;
            to.format = from.format;
            to.formatOptionGroups = from.formatOptionGroups;
            to.groupByFunction = from.groupByFunction;
            to.groupByFunctionOptions = from.groupByFunctionOptions;
            to.groupBySubtotalFunction = from.groupBySubtotalFunction;
            to.groupBySubtotalFunctionOptions = from.groupBySubtotalFunctionOptions;
            to.sort = from.sort;
            to.italic = from.italic;
            to.columnGroup = from.columnGroup;
            to.separator = from.separator;
            to.textHighlight = from.textHighlight;
            to.cellHighlight = from.cellHighlight;
            to.valueRange = from.valueRange;
            to.width = from.width;
            to.labelJustification = from.labelJustification;
            to.valueJustification = from.valueJustification;
            to.gradient = from.gradient;
            to.visible = from.visible;
            to.bold = from.bold;
            to.drillDownStyle = from.drillDownStyle;
            to.customUrl = from.customUrl;
            to.subreport = from.subreport;
            to.validateMessages = from.validateMessages;
            to.validateMessageLevel = from.validateMessageLevel;
        };
        /**
         * Reset datasources state
         */
        IzendaInstantReportStorageService.prototype.resetDataSources = function () {
            var _this = this;
            var datasources = this.getDataSources();
            if (!angular.isArray(datasources))
                return;
            datasources.forEach(function (category) {
                category.visible = true;
                category.active = false;
                category.enabled = true;
                category.collapsed = true;
                // iterate tables
                category.tables.forEach(function (table) {
                    table.visible = true;
                    table.active = false;
                    table.enabled = true;
                    table.collapsed = true;
                    table.validateMessages = [];
                    table.validateMessageLevel = null;
                    // iterate fields
                    table.fields.forEach(function (field) {
                        _this.resetFieldObject(field);
                    });
                });
            });
        };
        /**
         * Refresh field description
         */
        IzendaInstantReportStorageService.prototype.autoUpdateFieldDescription = function (field) {
            if (!field.isDescriptionSetManually) {
                field.description = this.generateDescription(field);
            }
        };
        /**
         * Convert fields which got from server into format which used in app and add it to table object.
         * @param {Array} fields. Server side fields object.
         */
        IzendaInstantReportStorageService.prototype.convertAndAddFields = function (tableObject, fields) {
            var _this = this;
            if (fields && fields.length)
                fields.forEach(function (field) {
                    var fieldObject = _this.createFieldObject(field.name, tableObject.id, tableObject.sysname, tableObject.name, field.sysname, field.typeGroup, field.type, field.sqlType, field.allowedInFilters, field.isSpParameter === 'True');
                    _this.autoUpdateFieldDescription(fieldObject);
                    tableObject.fields.push(fieldObject);
                });
            tableObject.lazy = false;
        };
        /**
        * Convert datasources for future use it in app
        */
        IzendaInstantReportStorageService.prototype.convertDataSources = function (dataSources) {
            var _this = this;
            if (!angular.isArray(dataSources))
                return [];
            var result = [];
            // iterate categories
            var uncategorized = null;
            dataSources.forEach(function (category) {
                var categoryObject = {
                    id: _this.getNextId(),
                    name: category.DataSourceCategory,
                    tables: [],
                    visible: true,
                    active: false,
                    enabled: true,
                    collapsed: true
                };
                // iterate tables
                category.tables.forEach(function (table) {
                    var tableObject = {
                        id: _this.getNextId(),
                        order: 0,
                        parentId: categoryObject.id,
                        name: table.name,
                        sysname: table.sysname,
                        tableType: table.tableType,
                        fields: [],
                        visible: true,
                        active: false,
                        enabled: true,
                        collapsed: true,
                        validateMessages: [],
                        validateMessageLevel: null,
                        lazy: null
                    };
                    // add field if loaded
                    if (table.fields === 'LAZIED') {
                        tableObject.lazy = true;
                    }
                    else {
                        _this.convertAndAddFields(tableObject, table.fields);
                    }
                    categoryObject.tables.push(tableObject);
                });
                if (_this.$izendaUtilService.isUncategorized(categoryObject.name)
                    && _this.$izendaInstantReportSettingsService.getSettings().moveUncategorizedToLastPosition) {
                    uncategorized = categoryObject;
                }
                else {
                    result.push(categoryObject);
                }
            });
            // move uncategorized to the last position:
            if (uncategorized !== null) {
                result.push(uncategorized);
            }
            if (result.length > 0) {
                result[0].collapsed = false;
            }
            return result;
        };
        IzendaInstantReportStorageService.prototype.createFieldObjectForSend = function (field) {
            return {
                guid: field.guid,
                sysname: field.sysname,
                description: field.description ? field.description : this.$izendaUtilService.humanizeVariableName(field.name),
                format: field.format,
                groupByFunction: field.groupByFunction,
                groupBySubtotalFunction: field.groupBySubtotalFunction,
                subtotalExpression: field.subtotalExpression,
                allowedInFilters: field.allowedInFilters,
                sort: field.sort,
                order: field.order,
                italic: field.italic,
                columnGroup: field.columnGroup,
                separator: field.separator,
                valueRange: field.valueRange,
                textHighlight: field.textHighlight,
                cellHighlight: field.cellHighlight,
                width: field.width,
                labelJustification: field.labelJustification,
                valueJustification: field.valueJustification,
                gradient: field.gradient,
                visible: field.visible,
                isVgUsed: field.isVgUsed,
                breakPageAfterVg: field.breakPageAfterVg,
                bold: field.bold,
                drillDownStyle: field.drillDownStyle,
                customUrl: field.customUrl,
                subreport: field.subreport,
                expression: field.expression,
                expressionType: field.expressionType.value,
                groupByExpression: field.groupByExpression
            };
        };
        /**
         * Create object with report data which will be send to server.
         */
        IzendaInstantReportStorageService.prototype.createReportSetConfigForSend = function (previewTop) {
            var _this = this;
            // iterate through active fields.
            var activeTables = this.getActiveTables();
            if (activeTables.length === 0)
                return null;
            var options = angular.extend({}, this.getOptions());
            var filterOptions = angular.extend({}, this.getFilterOptions());
            var reportSetConfig = {
                reportName: this.reportSet.reportName,
                reportCategory: this.reportSet.reportCategory,
                joinedTables: [],
                drillDownFields: [],
                fields: [],
                filters: [],
                charts: [],
                options: options,
                filterOptions: filterOptions,
                schedule: null,
                share: {},
                pivot: null
            };
            if (typeof (reportSetConfig.options.page.itemsPerPage) !== 'number') {
                reportSetConfig.options.page.itemsPerPage = parseInt(reportSetConfig.options.page.itemsPerPage);
            }
            // preview top
            var reportTop = parseInt(reportSetConfig.options.top);
            if (angular.isNumber(previewTop)) {
                if (!isNaN(reportTop) && (reportTop < previewTop || previewTop < 0))
                    reportSetConfig.options.top = reportTop;
                else
                    reportSetConfig.options.top = previewTop;
            }
            // schedule
            reportSetConfig.schedule = this.$izendaScheduleService.getScheduleConfigForSend();
            // share
            reportSetConfig.share = this.$izendaShareService.getShareConfigForSend();
            // add drilldown fields.
            reportSetConfig.drillDownFields = this.getDrillDownFields().map(function (f) { return f.sysname; });
            // add charts
            if (this.reportSet.charts.length > 0) {
                var chart = this.reportSet.charts[0];
                if (chart) {
                    reportSetConfig.charts[0] = {
                        name: chart.name,
                        category: chart.categoryName,
                        properties: chart.properties ? chart.properties : null
                    };
                }
            }
            // prepare tables
            var activeFieldsList = this.getAllActiveFields();
            activeFieldsList.sort(function (field1, field2) { return field1.order - field2.order; });
            for (var i = 0; i < activeFieldsList.length; i++)
                activeFieldsList[i].order = i + 1;
            // add filters to config
            this.getFilters().forEach(function (filter) {
                if (filter.field === null || !angular.isObject(filter.operator)) {
                    filter.isValid = false;
                    return;
                }
                filter.isValid = true;
                // prepare filter values to send
                var preparedValues = filter.values;
                // date string created according to format which used in "internal static string DateLocToUs(string date)":
                var valueType = _this.getFieldFilterOperatorValueType(filter.operator);
                if (valueType === 'select_multiple' || valueType === 'select_popup' || valueType === 'select_checkboxes') {
                    preparedValues = [filter.values.join(',')];
                }
                else if (valueType === 'field' && filter.values.length === 1 && filter.values[0] !== null) {
                    preparedValues = [filter.values[0].sysname];
                }
                else if (valueType === 'twoDates') {
                    var momentObj1 = null;
                    var momentObj2 = null;
                    if (filter.values[0])
                        momentObj1 = moment(filter.values[0]);
                    if (filter.values[1])
                        momentObj2 = moment(filter.values[1]);
                    preparedValues = [
                        momentObj1 && momentObj1.isValid() ? momentObj1.format(_this.$izendaSettingsService.getDefaultDateFormatString()) : null,
                        momentObj2 && momentObj2.isValid() ? momentObj2.format(_this.$izendaSettingsService.getDefaultDateFormatString()) : null
                    ];
                }
                else if (valueType === 'oneDate') {
                    var momentObj = null;
                    if (filter.values[0])
                        momentObj = moment(filter.values[0]);
                    preparedValues = [
                        momentObj && momentObj.isValid() ? momentObj.format(_this.$izendaSettingsService.getDefaultDateFormatString()) : null
                    ];
                }
                var filterObj = {
                    required: filter.required,
                    description: filter.description,
                    parameter: filter.parameter,
                    sysname: filter.field.sysname,
                    operatorString: filter.operator.value,
                    values: preparedValues,
                    titleFormat: filter.titleFormat,
                    customPopupTemplateUrl: filter.customPopupTemplateUrl
                };
                var isBlank = filterObj.values.every(function (v) { return v === ''; });
                if (isBlank)
                    filterObj.values = [];
                reportSetConfig.filters.push(filterObj);
            });
            // pivot
            this.$izendaInstantReportPivotService.syncPivotState(this.getAllFieldsInActiveTables());
            var pivotConfig = this.$izendaInstantReportPivotService.getPivotDataForSend();
            if (!pivotConfig)
                reportSetConfig.pivot = null;
            else {
                reportSetConfig.pivot = {
                    options: pivotConfig.options
                };
                reportSetConfig.pivot.pivotColumn = this.createFieldObjectForSend(pivotConfig.pivotColumn);
                reportSetConfig.pivot.cellValues = pivotConfig.cellValues
                    .filter(function (c) { return !!c; })
                    .map(function (c) { return _this.createFieldObjectForSend(c); });
            }
            // fill joined tables:
            reportSetConfig.joinedTables = activeTables.map(function (t) {
                return { sysname: t.sysname };
            });
            // fill fields
            activeTables.forEach(function (table) {
                var activeFields = _this.getActiveFields(table);
                reportSetConfig.fields.pushAll(activeFields.map(_this.createFieldObjectForSend));
            });
            // update field order 
            reportSetConfig.fields.sort(function (f1, f2) {
                if (f1.isVgUsed ^ f2.isVgUsed)
                    if (f1.isVgUsed)
                        return -1;
                    else
                        return 1;
                else
                    return f1.order - f2.order;
            });
            reportSetConfig.fields.forEach(function (f) { return f.order = _this.getNextOrder(); });
            this.$log.debug('reportSetConfig: ', reportSetConfig);
            return reportSetConfig;
        };
        /**
         * Load fields for lazy table
         * @param {object} table
         */
        IzendaInstantReportStorageService.prototype.loadLazyFields = function (table) {
            var _this = this;
            return this.$q(function (resolve) {
                if (!table.lazy) {
                    resolve(false);
                    return;
                }
                _this.$izendaInstantReportQueryService.getFieldsInfo(table.sysname).then(function (data) {
                    _this.convertAndAddFields(table, data.fields);
                    resolve(true);
                });
            });
        };
        /**
         * Clear report preview.
         */
        IzendaInstantReportStorageService.prototype.clearReportPreviewHtml = function () {
            this.previewHtml = '';
            this.$izendaInstantReportQueryService.cancelAllPreviewQueries();
        };
        /**
         * Get and apply preview for current report set config.
         */
        IzendaInstantReportStorageService.prototype.getReportPreviewHtml = function () {
            var _this = this;
            this.clearReportPreviewHtml();
            this.isPreviewSplashVisible = true;
            this.$rootScope.$applyAsync();
            return this.$q(function (resolve) {
                var options = _this.getOptions();
                var reportSetToSend = _this.createReportSetConfigForSend(options.previewTop);
                _this.$izendaInstantReportQueryService.getReportSetPreviewQueued(reportSetToSend).then(function (data) {
                    _this.previewHtml = data;
                    _this.isPreviewSplashVisible = false;
                    _this.getOptions().rowsRange = null;
                    _this.$rootScope.$applyAsync();
                    resolve();
                }, function () {
                    // reject
                    _this.isPreviewSplashVisible = false;
                    _this.$rootScope.$applyAsync();
                    resolve();
                });
            });
        };
        /**
         * Set top value for preview
         */
        IzendaInstantReportStorageService.prototype.setPreviewTop = function (value) {
            var options = this.getOptions();
            if (!angular.isNumber(value) || value < 0) {
                options.previewTop = -2147483648;
            }
            else {
                options.previewTop = value;
            }
        };
        /**
         * Save report set
         */
        IzendaInstantReportStorageService.prototype.saveReportSet = function (name, category) {
            var _this = this;
            var rs = this.getReportSet();
            var nameToSave = angular.isDefined(name) ? name : rs.reportName;
            var categoryToSave = angular.isString(category) && category !== '' ? category : '';
            rs.reportName = nameToSave;
            rs.reportCategory = categoryToSave;
            if (this.$izendaUtilService.isUncategorized(rs.reportCategory))
                rs.reportCategory = '';
            var reportSetToSend = this.createReportSetConfigForSend();
            return this.$q(function (resolve, reject) {
                _this.$izendaInstantReportQueryService.saveReportSet(reportSetToSend).then(function (result) {
                    var reportSetFullName = _this.getReportSetFullName();
                    if (angular.isString(reportSetFullName))
                        _this.$izendaUrlService.setReportFullName(reportSetFullName);
                    resolve(result);
                }, function (error) {
                    reject(error);
                });
            });
        };
        /**
         * Send send report set to server and set it as CRS
         */
        IzendaInstantReportStorageService.prototype.setReportSetAsCrs = function (applyPreviewTop) {
            var _this = this;
            return this.$q(function (resolve) {
                var reportSetToSend = _this.createReportSetConfigForSend();
                if (applyPreviewTop)
                    reportSetToSend.options.applyPreviewTop = true;
                _this.$izendaInstantReportQueryService.setReportAsCrs(reportSetToSend).then(function (result) {
                    if (result === 'OK') {
                        resolve([true]);
                    }
                    else {
                        resolve([false, result]);
                    }
                });
            });
        };
        /**
         * Generate pdf with current report and send file to user
         */
        IzendaInstantReportStorageService.prototype.exportReportAs = function (exportType) {
            var _this = this;
            return this.$q(function (resolve) {
                var reportSetToSend = _this.createReportSetConfigForSend();
                reportSetToSend.options.applyPreviewTop = false;
                _this.$izendaInstantReportQueryService
                    .exportReportInNewWindow(reportSetToSend, exportType)
                    .then(function () { return resolve(true); });
            });
        };
        /**
         * Generate html and open print page.
         */
        IzendaInstantReportStorageService.prototype.printReportAsHtml = function () {
            var _this = this;
            return this.$q(function (resolve) {
                var reportSetToSend = _this.createReportSetConfigForSend();
                reportSetToSend.options.applyPreviewTop = false;
                _this.$izendaInstantReportQueryService
                    .exportReportInNewWindow(reportSetToSend, 'print')
                    .then(function () { return resolve(true); });
            });
        };
        /**
         * Print report function
         */
        IzendaInstantReportStorageService.prototype.printReport = function (printType) {
            var _this = this;
            return this.$q(function (resolve) {
                if (printType === 'html') {
                    _this.printReportAsHtml()
                        .then(function (success) { return resolve({
                        success: success,
                        message: ''
                    }); });
                }
                else if (printType === 'pdf') {
                    _this.exportReportAs('PDF').then(function (success) { return resolve({
                        success: success,
                        message: ''
                    }); });
                }
                else {
                    resolve({
                        success: false,
                        message: "Unknown print type " + printType
                    });
                }
            });
        };
        /**
         * Open report in report designer.
         */
        IzendaInstantReportStorageService.prototype.openReportInDesigner = function () {
            var _this = this;
            this.setReportSetAsCrs().then(function () {
                var url = _this.$izendaUrlService.settings.urlReportDesigner;
                if (angular.isString(_this.reportSet.reportName) && _this.reportSet.reportName !== '')
                    url += "?rn=" + _this.getReportSetFullName() + "&tab=Fields";
                else
                    url += '?tab=Fields';
                _this.$window.location.href = getAppendedUrl(url);
            });
        };
        /**
         * Export report function
         */
        IzendaInstantReportStorageService.prototype.exportReport = function (exportType) {
            var _this = this;
            return this.$q(function (resolve) {
                if (exportType === 'excel') {
                    _this.exportReportAs('XLS(MIME)')
                        .then(function (success) { return resolve({
                        success: success,
                        message: ''
                    }); });
                }
                else if (exportType === 'word') {
                    _this.exportReportAs('DOC')
                        .then(function (success) { return resolve({
                        success: success,
                        message: ''
                    }); });
                }
                else if (exportType === 'csv') {
                    var exportMode = _this.$izendaSettingsService.getBulkCsv() ? 'BULKCSV' : 'CSV';
                    _this.exportReportAs(exportMode)
                        .then(function (success) { return resolve({
                        success: success,
                        message: ''
                    }); });
                }
                else if (exportType === 'xml') {
                    _this.exportReportAs('XML')
                        .then(function (success) { return resolve({
                        success: success,
                        message: ''
                    }); });
                }
                else {
                    resolve({
                        success: false,
                        message: "Unknown export type " + exportType
                    });
                }
            });
        };
        /**
         * Send report link via client email
         */
        IzendaInstantReportStorageService.prototype.sendReportLinkEmail = function () {
            var reportInfo = this.$izendaUrlService.getReportInfo();
            if (!angular.isObject(reportInfo) || !angular.isString(reportInfo.fullName) || reportInfo.fullName === '')
                throw 'Can\'t send email without report name';
            var reportViewerLocation = location.href.replaceAll(this.$izendaUrlService.settings.urlInstantReport, this.$izendaUrlService.settings.urlReportViewer);
            var redirectUrl = "?subject=" + encodeURIComponent(reportInfo.fullName) + "&body=" + encodeURIComponent(reportViewerLocation);
            redirectUrl = "mailto:" + redirectUrl.replace(/ /g, '%20');
            this.$window.top.location.href = getAppendedUrl(redirectUrl);
        };
        /**
         * Load instant report datasources
         */
        IzendaInstantReportStorageService.prototype.loadDataSources = function () {
            var _this = this;
            return this.$q(function (resolve) {
                _this.$izendaInstantReportQueryService.getConstraintsInfo().then(function (constraintsData) {
                    _this.setConstraints(constraintsData);
                    _this.$izendaInstantReportQueryService.getDatasources().then(function (data) {
                        _this.setDataSources(_this.convertDataSources(data));
                        resolve();
                    });
                });
            });
        };
        /////////////////////////////////////////
        // charts
        /////////////////////////////////////////
        /**
         * Set current chart
         */
        IzendaInstantReportStorageService.prototype.selectChart = function (chart) {
            this.reportSet.charts[0] = chart;
        };
        /**
         * Get current chart
         */
        IzendaInstantReportStorageService.prototype.getSelectedChart = function () {
            return this.reportSet.charts.length ? this.reportSet.charts[0] : null;
        };
        /////////////////////////////////////////
        // filters
        /////////////////////////////////////////
        IzendaInstantReportStorageService.prototype.validateFilter = function (filter) {
            filter.isValid = true;
            filter.validationMessages = [];
            filter.validationMessageString = '';
            // check: is filter refer to field which in active table.
            if (filter.field !== null) {
                var filterField_1 = filter.field;
                var found = this.getAllFieldsInActiveTables(true).some(function (f) { return f.sysname === filterField_1.sysname; });
                if (!found) {
                    filter.isValid = false;
                    filter.validationMessages.push(this.$izendaLocaleService.localeText('js_FilterFieldIsntIncluded', 'Filter field refers on datasource which isn\'t included to report'));
                    filter.validationMessageString = filter.validationMessages.join(', ');
                }
            }
        };
        /**
         * Disable filters which are not pass validation
         */
        IzendaInstantReportStorageService.prototype.validateFilters = function () {
            var _this = this;
            this.reportSet.filters.forEach(function (f) { return _this.validateFilter(f); });
        };
        /**
         * Mark filters as ready to use.
         */
        IzendaInstantReportStorageService.prototype.startFilters = function () {
            this.reportSet.filters.forEach(function (f) { return f.isFilterReady = true; });
        };
        /**
         * Find filter operator by string value
         */
        IzendaInstantReportStorageService.prototype.getFilterOperatorByValue = function (filter, value) {
            if (!angular.isString(value) || !value)
                return null;
            return filter.operators.firstOrDefault(function (f) { return f.value === value; });
        };
        /**
         * Check all stored procedure parameters assigned in filters
         */
        IzendaInstantReportStorageService.prototype.isAllSpParametersAssigned = function () {
            var spParamFields = this.getAllFieldsInActiveTables().filter(function (field) { return field.isSpParameter; });
            if (!spParamFields.length)
                return true;
            var filters = this.getFilters();
            var foundUnassignedParam = false;
            spParamFields.forEach(function (field) {
                var found = filters.some(function (f) { return f.field && f.field === field; });
                if (!found)
                    foundUnassignedParam = true;
            });
            return !foundUnassignedParam;
        };
        /**
         * Get filter operator list for field
         */
        IzendaInstantReportStorageService.prototype.getFieldFilterOperatorList = function (field) {
            var _this = this;
            return this.$q(function (resolve) {
                var tablesParam = _this.getActiveTables().map(function (table) { return table.sysname; }).join(',');
                _this.$izendaInstantReportQueryService.getFieldOperatorList(field, tablesParam).then(function (data) {
                    var result = [];
                    data.forEach(function (d) {
                        var groupName = d.name ? d.name : undefined;
                        result = result.concat(d.options
                            .filter(function (o) { return o.value !== '...'; })
                            .map(function (o) { return angular.extend({ groupName: groupName }, o); }));
                    });
                    resolve(result);
                });
            });
        };
        /**
         * Set filter operator and update available values
         */
        IzendaInstantReportStorageService.prototype.setFilterOperator = function (filter, operatorName) {
            var _this = this;
            return this.$q(function (resolve) {
                if (!angular.isObject(filter.field)) {
                    filter.operators = [];
                    filter.operator = null;
                    resolve(filter);
                    return;
                }
                _this.getFieldFilterOperatorList(filter.field).then(function (result) {
                    // select filter operator to apply
                    var operatorNameToApply = null;
                    if (filter.operator)
                        operatorNameToApply = filter.operator.value;
                    if (angular.isString(operatorName))
                        operatorNameToApply = operatorName;
                    filter.operators = result;
                    filter.operator = _this.getFilterOperatorByValue(filter, operatorNameToApply);
                    // update field value
                    var operatorType = _this.getFieldFilterOperatorValueType(filter.operator);
                    if (operatorType === 'field') {
                        filter.values = [_this.getFieldBySysName(filter.values[0])];
                    }
                    else if (operatorType === 'oneDate' || operatorType === 'twoDates') {
                        filter.values = filter.values.map(function (v) {
                            var parsedDate = moment(v, [_this.$izendaSettingsService.getDefaultDateFormatString(), _this.$izendaSettingsService.getDefaultDateFormatString('M/D/YYYY')], true);
                            if (parsedDate.isValid())
                                return parsedDate._d;
                            return null;
                        });
                    }
                    else if (filter.operator && filter.operator.value === 'Equals_TextArea') {
                        filter.currentValue = filter.values.join();
                    }
                    resolve(filter);
                });
            });
        };
        /**
         * Load filter existent values list (you need to ensure that all operators were applied before starting update existing values)
         */
        IzendaInstantReportStorageService.prototype.updateFieldFilterExistentValues = function (filter, forceUpdate) {
            var _this = this;
            // parse unicode symbols util
            var parseHtmlUnicodeEntities = function (str) {
                return angular.element('<textarea />').html(str).text();
            };
            // convert options which we have got from server.
            var convertOptionsForSelect = function (options, operatorType) {
                if (!angular.isArray(options))
                    return [];
                var result = [];
                options.forEach(function (option) {
                    if (option.value === '...') {
                        if (operatorType === 'select' || operatorType === 'inTimePeriod' || operatorType === 'select_multiple') {
                            option.text = parseHtmlUnicodeEntities(option.text);
                            option.value = option.value;
                            result.push(option);
                        }
                    }
                    else {
                        option.text = parseHtmlUnicodeEntities(option.text);
                        option.value = option.value;
                        result.push(option);
                    }
                });
                return result;
            };
            var syncValues = function (filterObject) {
                if (filterObject.values.length === 0 || filterObject.operator.value === 'Equals_Autocomplete')
                    return;
                filterObject.values = filterObject.values.filter(function (fv) {
                    return filterObject.existentValues.map(function (e) { return e.value; }).includes(fv);
                });
            };
            // return promise
            return this.$q(function (resolve) {
                if (!angular.isObject(filter)) {
                    resolve(filter);
                    return;
                }
                if (!angular.isObject(filter.field) || !angular.isObject(filter.operator)) {
                    filter.existentValues = [];
                    filter.values = [];
                    filter.initialized = true;
                    resolve(filter);
                    return;
                }
                var isCascadingDisabled = _this.$window.nrvConfig && !_this.$window.nrvConfig.CascadeFilterValues;
                if (!forceUpdate && (_this.reportSet.filterOptions.filterLogic || isCascadingDisabled)) {
                    resolve(filter);
                    return;
                }
                // get constraint filters
                var allFilters = _this.getFilters();
                var idx = allFilters.indexOf(filter);
                if (idx < 0)
                    throw "Filter " + (filter.field !== null ? filter.field.sysname : '') + " isn't found in report set filters collection.";
                // Add constraint filters if filter logic wasn't applied
                var constraintFilters = [];
                if (!_this.reportSet.filterOptions.filterLogic)
                    constraintFilters = allFilters.slice(0, idx);
                // load existent values
                var operatorType = _this.getFieldFilterOperatorValueType(filter.operator);
                if (['select', 'Equals_Autocomplete', 'select_multiple', 'select_popup', 'select_checkboxes'].indexOf(operatorType) >= 0) {
                    _this.setReportSetAsCrs(false).then(function () {
                        _this.$izendaInstantReportQueryService
                            .getExistentValuesList(_this.getActiveTables(), constraintFilters, filter, true, _this.reportSet.filterOptions.filterLogic)
                            .then(function (data) {
                            filter.existentValues = convertOptionsForSelect(data && data.length ? data[0].options : [], operatorType);
                            syncValues(filter);
                            var defaultValue = _this.$izendaUtilService.getOptionByValue(filter.existentValues, '...');
                            if (filter.values.length === 0 && defaultValue)
                                filter.values = [defaultValue.value];
                            filter.initialized = true;
                            resolve(filter);
                        });
                    });
                }
                else if (operatorType === 'inTimePeriod') {
                    _this.$izendaInstantReportQueryService.getPeriodList().then(function (data) {
                        filter.existentValues = convertOptionsForSelect(data && data.length ? data[0].options : [], operatorType);
                        syncValues(filter);
                        var defaultValue = _this.$izendaUtilService.getOptionByValue(filter.existentValues, '...');
                        if (filter.values.length === 0 && defaultValue)
                            filter.values = [defaultValue.value];
                        filter.initialized = true;
                        resolve(filter);
                    });
                }
                else {
                    filter.existentValues = [];
                    filter.initialized = true;
                    resolve(filter);
                }
            });
        };
        /**
         * Set filter existing values when filterLogic
         */
        IzendaInstantReportStorageService.prototype.refreshFiltersForFilterLogic = function () {
            var _this = this;
            return this.$q(function (resolve) {
                if (!_this.reportSet.filterOptions.filterLogic) {
                    resolve();
                    return;
                }
                var allFilters = _this.getFilters();
                var promises = allFilters.map(function (filter) { return _this.updateFieldFilterExistentValues(filter, true); });
                _this.$q.all(promises).then(function () { return resolve(); });
            });
        };
        /**
         * Refresh next filter values.
         */
        IzendaInstantReportStorageService.prototype.refreshNextFiltersCascading = function (filter) {
            var _this = this;
            return this.$q(function (resolve) {
                var isCascadingDisabled = _this.$window.nrvConfig && !_this.$window.nrvConfig.CascadeFilterValues;
                if (_this.reportSet.filterOptions.filterLogic || isCascadingDisabled) {
                    resolve();
                    return;
                }
                var allFilters = _this.getFilters();
                // TODO: change to: const filtersToRefresh = allFilters.filter((f, fi) => {...});
                var filtersToRefresh;
                if (filter) {
                    var idx = allFilters.indexOf(filter);
                    if (idx < 0)
                        throw "Filter " + (filter.field !== null ? filter.field.sysname + ' ' : '') + "isn't found in report set filters collection.";
                    filtersToRefresh = allFilters.slice(idx + 1);
                }
                else {
                    filtersToRefresh = allFilters.slice(0);
                }
                // cascading filters update
                if (filtersToRefresh.length > 0) {
                    var refreshingFilter_1 = filtersToRefresh[0];
                    _this.updateFieldFilterExistentValues(refreshingFilter_1).then(function () {
                        _this.refreshNextFiltersCascading(refreshingFilter_1).then(function () {
                            // we don't need to call markAllFiltersAsRefreshing(false); here, because the last time when that function
                            // will be called - it will go through the "else" condition.
                            resolve(filter);
                        });
                    });
                }
                else {
                    resolve(filter);
                }
            });
        };
        /**
         * Create filter object without loading its format.
         */
        IzendaInstantReportStorageService.prototype.createNewFilterBase = function (fieldSysName, operatorName, values, required, description, parameter, customPopupTemplateUrl) {
            var filterObject = angular.extend({}, this.$injector.get('izendaFilterObjectDefaults'));
            // set field
            var field;
            if (fieldSysName && fieldSysName.indexOf('fldId|') === 0) {
                field = this.getCalcField(fieldSysName);
            }
            else
                field = this.getFieldBySysName(fieldSysName);
            while (field && field.mcAncestor)
                field = field.mcAncestor;
            filterObject.field = field;
            if (angular.isDefined(values)) {
                filterObject.values = values;
                if (operatorName === 'Equals_Autocomplete')
                    filterObject.values = [values.join(',')];
            }
            if (angular.isDefined(required))
                filterObject.required = required;
            if (angular.isDefined(description))
                filterObject.description = description;
            if (angular.isDefined(parameter))
                filterObject.parameter = parameter;
            if (angular.isDefined(operatorName))
                filterObject.operatorString = operatorName;
            if (angular.isDefined(customPopupTemplateUrl))
                filterObject.customPopupTemplateUrl = customPopupTemplateUrl;
            return filterObject;
        };
        /**
         * Load possible formats collection and set format for filter string in description.
         * @param {object} filter. Filter object (field must me set to apply format)
         * @param {string} titleFormatName. Format object value
         * @returns {angular promise}. Promise parameter: filter object.
         */
        IzendaInstantReportStorageService.prototype.loadFilterFormats = function (filter, titleFormatName) {
            var _this = this;
            // load and set filter format:
            var filterFormatNameToApply = this.emptyFieldFormatOption.value;
            if (angular.isString(titleFormatName) && titleFormatName !== '')
                filterFormatNameToApply = titleFormatName;
            return this.$q(function (resolve) {
                if (filter.field) {
                    _this.$izendaInstantReportQueryService.getFilterFormats(filter).then(function (returnObj) {
                        filter.titleFormats = _this.$izendaUtilService.convertOptionsByPath(returnObj);
                        filter.titleFormat = _this.$izendaUtilService.getOptionByValue(filter.titleFormats, filterFormatNameToApply);
                        resolve(filter);
                    });
                }
                else {
                    resolve(filter);
                }
            });
        };
        /**
         * Create new filter object with default values
         */
        IzendaInstantReportStorageService.prototype.createNewFilter = function (fieldSysName, operatorName, values, required, description, parameter, titleFormatName, customPopupTemplateUrl) {
            var filterObject = this.createNewFilterBase(fieldSysName, operatorName, values, required, description, parameter, customPopupTemplateUrl);
            filterObject.isFilterReady = true;
            return this.loadFilterFormats(filterObject, titleFormatName);
        };
        /**
         * Delete filter from collection
         */
        IzendaInstantReportStorageService.prototype.removeFilter = function (filter) {
            var index = this.reportSet.filters.indexOf(filter);
            if (index >= 0) {
                this.reportSet.filters[index].field = null;
                this.reportSet.filters.splice(index, 1);
            }
        };
        /**
         * Swap filter
         */
        IzendaInstantReportStorageService.prototype.swapFilters = function (index0, index1) {
            var filters = this.reportSet.filters;
            var temp = filters[index0];
            filters[index0] = filters[index1];
            filters[index1] = temp;
        };
        /**
         * Move filter from position to position
         */
        IzendaInstantReportStorageService.prototype.moveFilterTo = function (fromIndex, toIndex) {
            this.reportSet.filters.splice(toIndex, 0, this.reportSet.filters.splice(fromIndex, 1)[0]);
        };
        /**
         * Check current active tables and remove filters which connected to non-active fields
         */
        IzendaInstantReportStorageService.prototype.syncFilters = function () {
            var _this = this;
            var aFields = this.getAllFieldsInActiveTables(true);
            var filters = this.getFilters();
            // find filters to remove
            var filtersToRemove = [];
            filters.forEach(function (filter) {
                var isFilterActive = aFields
                    .some(function (activeField) { return filter.field === null || activeField.sysname === filter.field.sysname; });
                if (!isFilterActive)
                    filtersToRemove.push(filter);
            });
            // remove filters
            filtersToRemove.forEach(function (f) { return _this.removeFilter(f); });
        };
        /**
         * Load custom template for popup filter.
         */
        IzendaInstantReportStorageService.prototype.getPopupFilterCustomTemplate = function (filter) {
            var _this = this;
            return this.$q(function (resolve) {
                var field = filter.field;
                if (!filter.field) {
                    resolve();
                    return;
                }
                var table = _this.getTableById(field.parentId);
                _this.$izendaInstantReportQueryService.getExistentPopupValuesList(field, table).then(function (data) {
                    if (data.userpage != null)
                        filter.customPopupTemplateUrl = data.userpage;
                    else
                        filter.customPopupTemplateUrl = null;
                    resolve();
                });
            });
        };
        /////////////////////////////////////////
        // field options
        /////////////////////////////////////////
        /**
         * Load field function and apply group by function to field
         */
        IzendaInstantReportStorageService.prototype.loadFieldFunctions = function (field, defaultGroupString) {
            var _this = this;
            return this.$q(function (resolve) {
                var groupToApply = angular.isString(defaultGroupString) && defaultGroupString
                    ? defaultGroupString
                    : 'NONE';
                _this.$izendaInstantReportQueryService
                    .getFieldFunctions(field, field.isPivotColumn ? 'pivotField' : 'field')
                    .then(function (returnObj) {
                    field.groupByFunctionOptions = _this.$izendaUtilService.convertOptionsByPath(returnObj);
                    var isSimpleGroupFunction = field.groupByFunctionOptions.length === 2
                        && field.groupByFunctionOptions[0].value.toLowerCase() === 'none'
                        && field.groupByFunctionOptions[1].value.toLowerCase() === 'group';
                    if (isSimpleGroupFunction && groupToApply.toLowerCase() === 'none')
                        groupToApply = 'GROUP';
                    field.groupByFunction = _this.getGroupByValue(field, groupToApply);
                    // if group list was changed and current group function not in list
                    if (field.groupByFunction === null)
                        field.groupByFunction = _this.getGroupByValue(field, 'NONE');
                    resolve(field);
                });
            });
        };
        /**
         * Load Subtotal field function and apply Subtotal group by function to field
         */
        IzendaInstantReportStorageService.prototype.loadSubtotalFieldFunctions = function (field, defaultGroupString) {
            var _this = this;
            return this.$q(function (resolve) {
                var groupToApply = angular.isString(defaultGroupString) && defaultGroupString
                    ? defaultGroupString
                    : 'DEFAULT';
                _this.$izendaInstantReportQueryService
                    .getFieldFunctions(field, 'subtotal')
                    .then(function (returnObj) {
                    field.groupBySubtotalFunctionOptions = _this.$izendaUtilService.convertOptionsByPath(returnObj);
                    field.groupBySubtotalFunction = _this.getGroupBySubtotalValue(field, groupToApply);
                    // if group list was changed and current group function not in list
                    if (field.groupBySubtotalFunction === null)
                        field.groupByFunction = _this.getGroupBySubtotalValue(field, 'DEFAULT');
                    resolve(field);
                });
            });
        };
        /**
         * Load group functions to field
         */
        IzendaInstantReportStorageService.prototype.loadGroupFunctionsAndFormatsToField = function (field, defaultGroupString, defaultFormatString, defaultSubtotalGroupString) {
            var _this = this;
            return this.$q(function (resolve) {
                var groupToApply = angular.isString(defaultGroupString) && defaultGroupString
                    ? defaultGroupString
                    : 'NONE';
                var groupSubtotalToApply = angular.isString(defaultSubtotalGroupString) && defaultSubtotalGroupString
                    ? defaultSubtotalGroupString
                    : 'DEFAULT';
                if (_this.isBinaryField(field)) {
                    // if field type doesn't support group by.
                    field.groupByFunctionOptions = [_this.emptyFieldGroupOption];
                    field.groupByFunction = _this.emptyFieldGroupOption;
                    field.groupBySubtotalFunctionOptions = [_this.emptySubtotalFieldGroupOptions];
                    field.groupBySubtotalFunction = _this.emptySubtotalFieldGroupOptions;
                    _this.updateFieldFormats(field, defaultFormatString).then(function (f) { return resolve(f); });
                }
                else {
                    // get field and Subtotal functions from server or request cache:
                    var functionPromise = _this.loadFieldFunctions(field, groupToApply);
                    var subtotalPromise = _this.loadSubtotalFieldFunctions(field, groupSubtotalToApply);
                    _this.$q
                        .all([functionPromise, subtotalPromise])
                        .then(function () {
                        return _this.updateFieldFormats(field, defaultFormatString)
                            .then(function () {
                            return resolve(field);
                        });
                    });
                }
            });
        };
        /**
         * Field initialization (async: returns promise)
         */
        IzendaInstantReportStorageService.prototype.initializeField = function (field) {
            var _this = this;
            return this.$q(function (resolve) {
                if (field.isInitialized) {
                    resolve(field);
                    return;
                }
                // load group and format collections:
                _this.loadGroupFunctionsAndFormatsToField(field).then(function (f) {
                    f.isInitialized = true;
                    resolve(f);
                });
            });
        };
        /**
         * Get current field which we are editing now.
         */
        IzendaInstantReportStorageService.prototype.getCurrentActiveField = function () {
            return this.currentActiveField;
        };
        /**
         * Set current field for editing it.
         */
        IzendaInstantReportStorageService.prototype.setCurrentActiveField = function (field) {
            this.currentActiveField = field;
        };
        /**
         * Create auto description.
         */
        IzendaInstantReportStorageService.prototype.generateDescription = function (field) {
            if (this.isFieldGrouped(field) && field.groupByFunction.value.toLowerCase() !== 'group')
                return field.groupByFunction.text + ' (' + this.$izendaUtilService.humanizeVariableName(field.name) + ')';
            else
                return this.$izendaUtilService.humanizeVariableName(field.name);
        };
        /**
         * Set aggregate function for field.
         */
        IzendaInstantReportStorageService.prototype.onFieldFunctionApplied = function (field) {
            // do not change format for max, min, sum and sum distinct
            if (this.isFieldGrouped(field)) {
                this.applyAutoGroups();
            }
            else {
                this.resetAutoGroups();
            }
            this.updateFieldFormats(field);
            // auto update description
            this.autoUpdateFieldDescription(field);
            this.syncCalcFieldsArray();
            // validate
            this.validateReport();
        };
        /**
         * Update functions, formats after expression typegroup was changed
         */
        IzendaInstantReportStorageService.prototype.onExpressionTypeGroupApplied = function (field) {
            var _this = this;
            this.loadGroupFunctionsAndFormatsToField(field, field.groupByFunction.value, field.format.value, field.groupBySubtotalFunction.value)
                .then(function () { return _this.syncCalcFieldsArray(); });
        };
        /**
         * Update calc fields collection when expression was changed.
         * @param {any} field - target field.
         */
        IzendaInstantReportStorageService.prototype.onExpressionApplied = function () {
            this.syncCalcFieldsArray();
        };
        /**
         * Update Ui and show preview
         */
        IzendaInstantReportStorageService.prototype.updateUiStateAndRefreshPreview = function () {
            // remove drilldowns which are not in active tables
            this.updateDrilldowns();
            // update pivot state
            this.$izendaInstantReportPivotService.syncPivotState(this.getAllFieldsInActiveTables());
            // update filters state
            this.syncFilters();
            // apply/reset autogroups
            if (this.getActiveTables().length === 0 || this.isActiveFieldsContainsBinary()) {
                this.resetAutoGroups();
            }
            else {
                this.applyAutoGroups();
            }
        };
        /**
         * Fires when user check/uncheck field
         */
        IzendaInstantReportStorageService.prototype.applyFieldChecked = function (field, value, restrictTableUncheck) {
            var _this = this;
            return this.$q(function (resolve) {
                if (!field.enabled) {
                    _this.validateReport();
                    resolve();
                    return;
                }
                field.checked = angular.isDefined(value) ? value : !field.checked;
                field.order = _this.getNextOrder();
                // update state of datasources tree
                _this.updateParentFoldersAndTables(field, false, restrictTableUncheck);
                _this.initializeField(field).then(function () {
                    _this.updateUiStateAndRefreshPreview();
                    resolve();
                });
            });
        };
        /**
         * Select/unselect field
         */
        IzendaInstantReportStorageService.prototype.applyFieldSelected = function (field, value) {
            if (!angular.isObject(field)) {
                this.unselectAllFields();
                this.setCurrentActiveField(null);
                return;
            }
            if (!field.enabled)
                return;
            if (field.isMultipleColumns) {
                field.collapsed = !field.collapsed;
                return;
            }
            this.unselectAllFields();
            this.setCurrentActiveField(null);
            if (value) {
                this.setCurrentActiveField(field);
                field.selected = value;
                this.initializeField(field);
            }
        };
        /**
         * Check/uncheck table
         */
        IzendaInstantReportStorageService.prototype.applyTableActive = function (table) {
            var _this = this;
            return this.$q(function (resolve) {
                var updateAndResolve = function () {
                    _this.updateParentFolders(table);
                    _this.updateUiStateAndRefreshPreview();
                    resolve();
                };
                if (!table.enabled) {
                    return;
                }
                table.active = !table.active;
                table.order = _this.getNextOrder();
                if (!table.active) {
                    // deactivate all table fields
                    table.fields.forEach(function (f) { return f.checked = false; });
                    updateAndResolve();
                    return;
                }
                // table activated
                if (table.lazy) {
                    // load lazy fields
                    _this.loadLazyFields(table).then(function () {
                        updateAndResolve();
                    });
                }
                else {
                    updateAndResolve();
                }
            });
        };
        IzendaInstantReportStorageService.prototype.prepareParentFieldForMultipleFields = function (field) {
            var parentField = field;
            if (parentField.multipleColumns.length === 0) {
                // if field has no multiple fields:
                var copyField = angular.copy(field);
                parentField = copyField;
                copyField.mcAncestor = field;
                copyField.originId = field.id;
                copyField.isMultipleColumns = true;
                copyField.multipleColumnsCounter = 1;
                copyField.multipleColumns.push(field);
                var table = this.getTableById(field.parentId);
                var fieldIndex = table.fields.indexOf(field);
                table.fields[fieldIndex] = copyField;
            }
            return parentField;
        };
        /**
         * Add ready-to-use another field (no need to clone parent field)
         */
        IzendaInstantReportStorageService.prototype.addExactAnotherField = function (field, anotherFieldProperties) {
            var anotherField = this.createFieldObjectInner(anotherFieldProperties);
            // add to parent field.
            var parentField = this.prepareParentFieldForMultipleFields(field);
            parentField.multipleColumns.push(anotherField);
            parentField.multipleColumnsCounter++;
            anotherField.parentFieldId = parentField.id;
            anotherField.parentId = parentField.parentId;
            anotherField.name = parentField.name + parentField.multipleColumnsCounter;
            anotherField.tableSysname = parentField.tableSysname;
            anotherField.tableName = parentField.tableName;
            anotherField.sysname = parentField.sysname;
            anotherField.typeGroup = parentField.typeGroup;
            anotherField.type = parentField.type;
            anotherField.sqlType = parentField.sqlType;
            anotherField.allowedInFilters = parentField.allowedInFilters;
            anotherField.isDescriptionSetManually = true;
            return anotherField;
        };
        /**
         * Add more than one same field to report
         */
        IzendaInstantReportStorageService.prototype.addAnotherField = function (field, needToSelect) {
            var _this = this;
            var parentField = this.prepareParentFieldForMultipleFields(field);
            // add another field to parentField
            parentField.multipleColumnsCounter++;
            var anotherField = this.createFieldObject(parentField.name + parentField.multipleColumnsCounter, parentField.parentId, parentField.tableSysname, parentField.tableName, parentField.sysname, parentField.typeGroup, parentField.type, parentField.sqlType, parentField.allowedInFilters, parentField.isSpParameter);
            if (parentField.description)
                anotherField.description = parentField.description + ' ' + (parentField.multipleColumns.length + 1);
            anotherField.allowedInFilters = parentField.allowedInFilters;
            anotherField.order = this.getNextOrder();
            anotherField.guid = this.guid();
            anotherField.parentFieldId = parentField.id;
            this.initializeField(anotherField).then(function () {
                _this.applyAutoGroups();
            });
            parentField.multipleColumns.push(anotherField);
            // select if needed
            if (needToSelect) {
                this.unselectAllFields();
                anotherField.selected = true;
                this.setCurrentActiveField(anotherField);
            }
            return anotherField;
        };
        /**
         * Apply field config to field
         */
        IzendaInstantReportStorageService.prototype.loadReportField = function (field, fieldConfig) {
            var _this = this;
            return this.$q(function (resolve) {
                var functionValue = fieldConfig.groupByFunction.value;
                var subtotalFunctionValue = fieldConfig.groupBySubtotalFunction.value;
                var formatValue = fieldConfig.format.value;
                angular.extend(field, fieldConfig);
                // remove column group from description: 'field description@column group'
                if (field.description.lastIndexOf('@') > 0 && field.columnGroup) {
                    field.description = field.description.substring(0, field.description.lastIndexOf('@'));
                }
                if (field.order > _this.orderCounter)
                    _this.orderCounter = field.order + 1;
                fieldConfig.expressionType = fieldConfig.expressionType || '...';
                var expressionType = _this.expressionTypes.firstOrDefault(function (e) { return e.value === fieldConfig.expressionType; });
                if (expressionType)
                    field.expressionType = expressionType;
                _this.loadGroupFunctionsAndFormatsToField(field, functionValue, formatValue, subtotalFunctionValue)
                    .then(function (f) {
                    if (fieldConfig.description) {
                        // if description differs from the default generated description: mark it as "set manually"
                        f.isDescriptionSetManually = fieldConfig.description !== _this.generateDescription(f);
                        f.description = fieldConfig.description;
                    }
                    else
                        _this.autoUpdateFieldDescription(f);
                    f.isInitialized = true;
                    resolve(f);
                });
            });
        };
        IzendaInstantReportStorageService.prototype.applyDescription = function (field) {
            var autoDescription = this.generateDescription(field);
            if (!field.description)
                field.isDescriptionSetManually = false;
            else
                field.isDescriptionSetManually = field.description !== autoDescription;
            this.syncCalcFieldsArray();
        };
        /**
         * Select drilldown fields
         */
        IzendaInstantReportStorageService.prototype.convertDrilldownFieldNamesToFields = function () {
            for (var i = 0; i < this.reportSet.drillDownFields.length; i++) {
                var currentItem = this.reportSet.drillDownFields[i];
                if (angular.isString(currentItem)) {
                    this.reportSet.drillDownFields[i] = this.getFieldBySysName(currentItem, true);
                }
            }
        };
        /**
         * Select charts
         */
        IzendaInstantReportStorageService.prototype.convertChartNamesToCharts = function () {
            for (var i = 0; i < this.reportSet.charts.length; i++) {
                var chart = this.reportSet.charts[i];
                if (chart && chart.hasOwnProperty('name') && chart.hasOwnProperty('category')) {
                    var vis = this.$izendaInstantReportVisualizationService.findVisualization(chart.category, chart.name);
                    vis.properties = this.reportSet.charts[i].properties;
                    this.reportSet.charts[i] = vis;
                }
            }
        };
        /**
         * Add loaded filters. reportSet.filters at this stage is not initialized
         * and we need to set field, operator and value objects.
         */
        IzendaInstantReportStorageService.prototype.loadFilters = function () {
            var _this = this;
            return this.$q(function (resolve) {
                var filterOperatorPromises = [];
                if (!angular.isArray(_this.reportSet.filters) || _this.reportSet.filters.length === 0) {
                    resolve();
                    return;
                }
                for (var i = 0; i < _this.reportSet.filters.length; i++) {
                    var filter = _this.reportSet.filters[i];
                    var filterConfig = {
                        fieldSysName: filter.sysname,
                        operatorName: filter.operatorString,
                        values: filter.values,
                        required: filter.required,
                        description: filter.description,
                        parameter: filter.parameter,
                        titleFormat: filter.titleFormat,
                        customPopupTemplateUrl: filter.customPopupTemplateUrl
                    };
                    var newFilter = _this.createNewFilterBase(filterConfig.fieldSysName, filterConfig.operatorName, filterConfig.values, filterConfig.required, filterConfig.description, filterConfig.parameter, filter.customPopupTemplateUrl);
                    _this.reportSet.filters[i] = newFilter;
                    // load filter formats
                    var formatLoadPromise = _this.loadFilterFormats(newFilter, filterConfig.titleFormat);
                    filterOperatorPromises.push(formatLoadPromise);
                    // set operator
                    var operatorPromise = void 0;
                    if (angular.isString(filterConfig.operatorName) && filterConfig.operatorName) {
                        operatorPromise = _this.setFilterOperator(newFilter, filterConfig.operatorName);
                    }
                    else {
                        operatorPromise = _this.setFilterOperator(newFilter, null);
                    }
                    filterOperatorPromises.push(operatorPromise);
                }
                // wait when all operators loaded
                _this.$q.all(filterOperatorPromises).then(function () {
                    var existentValuesPromises = _this.reportSet.filters.reduce(function (promise, filter) {
                        return promise.then(function () { return _this.updateFieldFilterExistentValues(filter, true); });
                    }, Promise.resolve([]));
                    // wait when all existent values loaded
                    _this.$q.all(existentValuesPromises).then(function () { return resolve(); });
                });
            });
        };
        /**
         * Initialize service for new report
         */
        IzendaInstantReportStorageService.prototype.newReport = function () {
            var _this = this;
            return this.$q(function (resolve) {
                if (!_this.isPageInitialized) {
                    _this.newReportLoadingSchedule = 'new!';
                    _this.$log.debug('newReport scheduled');
                    resolve(false);
                    return;
                }
                var promises = [];
                // load schedule data with default config for new report
                promises.push(_this.$izendaScheduleService.setScheduleConfig(null));
                promises.push(_this.$izendaShareService.setShareConfig(null));
                // set full access for new report:
                _this.$izendaCompatibilityService.setFullAccess();
                // load default table if defined
                var defaultTableName = _this.$izendaInstantReportSettingsService.getSettings().defaultTable;
                if (defaultTableName) {
                    var table = _this.getTableBySysname(defaultTableName) || _this.getTableByName(defaultTableName);
                    if (table) {
                        table.collapsed = false;
                        promises.push(_this.applyTableActive(table));
                    }
                }
                // wait until completed all asynchronous operations
                _this.$q.all(promises).then(function () { return resolve(); });
            });
        };
        /**
         * Load existing report
         */
        IzendaInstantReportStorageService.prototype.loadReport = function (reportFullName) {
            var _this = this;
            this.$log.debug("loadReport " + reportFullName + " start");
            return this.$q(function (resolve) {
                if (!_this.isPageInitialized) {
                    _this.existingReportLoadingSchedule = reportFullName;
                    _this.$log.debug('loadReport scheduled');
                    resolve([false]);
                    return;
                }
                // update UI params
                _this.currentActiveField = null;
                _this.setFiltersPanelOpened(false);
                var previousPreviewTop = 100;
                if (_this.reportSet && _this.reportSet.options)
                    previousPreviewTop = _this.reportSet.options.previewTop;
                // load report data
                _this.$izendaInstantReportQueryService.loadReport(reportFullName).then(function (reportSetConfig) {
                    _this.resetDataSources();
                    _this.reportSet = angular.extend(_this.reportSet, reportSetConfig);
                    _this.$izendaCompatibilityService.setRights(_this.reportSet.options.effectiveRights);
                    _this.$izendaCompatibilityService.setUsesHiddenColumns(_this.reportSet.options.usesHiddenColumns);
                    // update top
                    if (_this.reportSet.options.top < 0)
                        _this.reportSet.options.top = '';
                    _this.reportSet.options.previewTop = previousPreviewTop;
                    var lazyPromises = [];
                    _this.reportSet.joinedTables.forEach(function (tableObj) {
                        var table = _this.getTableBySysname(tableObj.sysname);
                        var loadFieldPromise = _this.loadLazyFields(table);
                        table.active = true;
                        table.order = _this.getNextOrder();
                        lazyPromises.push(loadFieldPromise);
                    });
                    // wait until table fields will be loaded:
                    _this.$q.all(lazyPromises).then(function () {
                        // initialization promises
                        var promises = [];
                        // convert chart names to chart objects collection
                        _this.convertChartNamesToCharts();
                        // convert drilldown field sysnames to fields collection:
                        _this.convertDrilldownFieldNamesToFields();
                        // load pivot fields
                        if (angular.isObject(_this.reportSet.pivot)) {
                            var pivotColumnConfig = angular.copy(_this.reportSet.pivot.pivotColumn);
                            var pivotColumnField = _this.getFieldBySysName(pivotColumnConfig.sysname, true);
                            _this.reportSet.pivot.pivotColumn = angular.copy(pivotColumnField);
                            _this.reportSet.pivot.pivotColumn.isPivotColumn = true;
                            promises.push(_this.loadReportField(_this.reportSet.pivot.pivotColumn, pivotColumnConfig));
                            for (var i = 0; i < _this.reportSet.pivot.cellValues.length; i++) {
                                var cellValueConfig = angular.copy(_this.reportSet.pivot.cellValues[i]);
                                _this.reportSet.pivot.cellValues[i] = angular.copy(_this.getFieldBySysName(cellValueConfig.sysname, true));
                                promises.push(_this.loadReportField(_this.reportSet.pivot.cellValues[i], cellValueConfig));
                            }
                        }
                        // convert fields
                        var addedFieldSysNames = [];
                        _this.reportSet.activeFields.forEach(function (activeField) {
                            var sysname = activeField.sysname;
                            var field = _this.getFieldBySysName(sysname, true);
                            if (!angular.isObject(field))
                                _this.$log.error("Field " + sysname + " not found in datasources");
                            var isFieldMultiple = addedFieldSysNames.indexOf(sysname) >= 0;
                            if (!isFieldMultiple) {
                                field.guid = activeField.guid;
                                promises.push(_this.loadReportField(field, activeField));
                                field.checked = true;
                                _this.updateParentFoldersAndTables(field, true);
                                addedFieldSysNames.push(sysname);
                            }
                            else {
                                var anotherField = _this.addExactAnotherField(field, activeField);
                                anotherField.guid = activeField.guid;
                                if (activeField.description) {
                                    anotherField.isDescriptionSetManually = true;
                                    anotherField.description = activeField.description;
                                }
                                promises.push(_this.loadReportField(anotherField, activeField));
                                anotherField.checked = true;
                            }
                        });
                        _this.syncCalcFieldsArray();
                        // pivots initialization
                        if (angular.isObject(_this.reportSet.pivot)) {
                            var pivotData = _this.reportSet.pivot;
                            promises.push(_this.$izendaInstantReportPivotService.loadPivotData(pivotData));
                            _this.reportSet.pivot = null;
                        }
                        // convert filters
                        promises.push(_this.loadFilters());
                        // load schedule data for config
                        var scheduleConfigData = angular.extend({}, reportSetConfig.schedule);
                        promises.push(_this.$izendaScheduleService.setScheduleConfig(scheduleConfigData));
                        // load share data for config
                        var shareConfigData = angular.extend([], reportSetConfig.share);
                        promises.push(_this.$izendaShareService.setShareConfig(shareConfigData));
                        // wait for all preparations completion
                        _this.$q.all(promises).then(function () {
                            _this.validateFilters();
                            _this.startFilters();
                            if (_this.$izendaCompatibilityService.isUsesHiddenColumns()) {
                                if (_this.reportSet.activeFields.length > 0)
                                    _this.$izendaUtilUiService.showMessageDialog(_this.$izendaLocaleService.localeText('js_reportSetUsesHiddenColumns', 'This ReportSet has publicly unavailable fields in configuration, therefore it misses some elements on current page, and cannot be saved/updated. Use Save As with different name instead.'));
                                else
                                    _this.$izendaUtilUiService.showMessageDialog(_this.$izendaLocaleService.localeText('js_reportSetUsesAllHiddenColumns', 'All fields in this report are unavailable. Please choose another fields and use Save As with different name instead.'));
                            }
                            _this.$log.debug('loadReport end');
                            resolve([true, true]);
                        });
                    });
                }, function (error) {
                    // error loading report set config
                    // show error dialog
                    _this.$izendaUtilUiService.showErrorDialog(_this.$izendaLocaleService.localeText('js_FailedToLoadReport', 'Failed to load report') + ': "' + error + '"', _this.$izendaLocaleService.localeText('js_ReportLoadError', 'Report load error'));
                    // redirect to new report
                    _this.$izendaUrlService.setIsNew();
                    resolve([true, false]);
                });
            });
        };
        /**
         * Remove another field
         */
        IzendaInstantReportStorageService.prototype.removeAnotherField = function (field, anotherField) {
            var idx = field.multipleColumns.indexOf(anotherField);
            if (idx >= 0) {
                if (this.getCurrentActiveField() === anotherField)
                    this.setCurrentActiveField(null);
                var isReplaceIdNeeded = field.originId === anotherField.id;
                field.multipleColumns.splice(idx, 1);
                if (field.multipleColumns.length > 0 && isReplaceIdNeeded)
                    field.multipleColumns[0].id = field.originId;
            }
            else {
                throw "Can't find " + anotherField.name + " in multipleColumns collection.";
            }
            if (field.multipleColumns.length === 1) {
                this.copyFieldObject(field.multipleColumns[0], field);
                field.multipleColumns = [];
                field.isMultipleColumns = false;
                field.collapsed = false;
                field.parentFieldId = null;
                this.autoUpdateFieldDescription(field);
            }
        };
        /**
         * Set sort value for field.
         */
        IzendaInstantReportStorageService.prototype.applyFieldSort = function (field, sortString) {
            if (angular.isString(sortString)) {
                if (sortString === 'asc') {
                    field.sort = 'asc';
                }
                else if (sortString === 'desc') {
                    field.sort = 'desc';
                }
                else {
                    if (!field.isVgUsed)
                        field.sort = null;
                }
            }
            else {
                if (!field.isVgUsed)
                    field.sort = null;
            }
        };
        /**
         * Set field italic
         */
        IzendaInstantReportStorageService.prototype.applyFieldItalic = function (field, value) {
            field.italic = value;
        };
        /**
         * Set field visible
         */
        IzendaInstantReportStorageService.prototype.applyFieldVisible = function (field, value) {
            if (!value)
                field.isVgUsed = false;
            field.visible = value;
        };
        /**
         * Set field bold
         */
        IzendaInstantReportStorageService.prototype.applyFieldBold = function (field, value) {
            field.bold = value;
        };
        /**
         * Set visual group
         */
        IzendaInstantReportStorageService.prototype.applyVisualGroup = function (field, value) {
            if (value && field.sort === null) {
                this.applyFieldSort(field, 'asc');
            }
            field.isVgUsed = value;
            this.updateVisualGroupFieldOrders(field);
        };
        /**
         * Column reorder. Indexes started from 1: 1,2,3,4,5,6
         */
        IzendaInstantReportStorageService.prototype.swapFields = function (fromIndex, toIndex) {
            if (fromIndex === toIndex)
                return;
            var activeFieldsSortedList = this.getAllActiveFields().filter(function (item) { return !item.isVgUsed; });
            activeFieldsSortedList.sort(function (f1, f2) { return f1.order - f2.order; });
            var field1 = activeFieldsSortedList[fromIndex - 1];
            var field2 = activeFieldsSortedList[toIndex - 1];
            var fieldOrder1 = field1.order;
            var fieldOrder2 = field2.order;
            field1.order = fieldOrder2;
            field2.order = fieldOrder1;
        };
        /**
         * We need to set visual group fields order first and other fields next.
         */
        IzendaInstantReportStorageService.prototype.updateVisualGroupFieldOrders = function (recentlyChangedField) {
            var _this = this;
            var activeFields = this.getAllActiveFields();
            var vgFields = activeFields.filter(function (f) { return f.isVgUsed; });
            // if we don't have VG fields - do nothing.
            if (vgFields.length === 0)
                return;
            // we need to update field orders:
            // vgField1, vgField2, ..., vgFieldN, nonVg1, nonVg2, ..., nonVgM
            // if we turned on visual group on currently changed field - move it to the last position of vg fields
            if (recentlyChangedField && recentlyChangedField.isVgUsed)
                recentlyChangedField.order = vgFields.reduce(function (max, f) { return f.order > max ? f.order : max; }, vgFields[0].order) + 1;
            // recalculate fields order
            vgFields.sort(function (a, b) { return a.order - b.order; });
            vgFields.forEach(function (f) { return f.order = _this.getNextOrder(); });
            var nonVgFields = activeFields.filter(function (f) { return !f.isVgUsed; });
            // if we turned off visual group on currently changed field - move it to the first position of non-vg fields.
            if (nonVgFields.length && recentlyChangedField && !recentlyChangedField.isVgUsed)
                recentlyChangedField.order = nonVgFields.reduce(function (min, f) { return f.order < min ? f.order : min; }, nonVgFields[0].order) - 1;
            // recalculate fields order
            nonVgFields.sort(function (a, b) { return a.order - b.order; });
            nonVgFields.forEach(function (f) { return f.order = _this.getNextOrder(); });
        };
        /**
         * Change field order
         */
        IzendaInstantReportStorageService.prototype.moveFieldToPosition = function (fromIndex, toIndex, isVisualGroup, takeCareOfInvisibleFields) {
            if (fromIndex === toIndex)
                return;
            var fields = this.getAllActiveFields().filter(function (field) {
                // extract vg|non-vg fields (depends on isVisualGroup param)
                return (isVisualGroup ^ field.isVgUsed) === 0;
            });
            var activeFieldsSorted = fields.sort(function (f1, f2) { return f1.order - f2.order; });
            var visibleFieldsSorted = takeCareOfInvisibleFields
                ? activeFieldsSorted.filter(function (f) { return f.visible; })
                : activeFieldsSorted;
            // calculate actual fromIndex and toIndex
            var fromElement = visibleFieldsSorted[fromIndex];
            if (takeCareOfInvisibleFields) {
                fromIndex = activeFieldsSorted.indexOf(fromElement);
                var element = visibleFieldsSorted[toIndex];
                toIndex = activeFieldsSorted.indexOf(element);
            }
            // Move element: fromIndex -> toIndex that way:
            // for example, we're sorting visual group columns which has orders activeFieldsSorted=[c1=1,c2=2,c3=5]
            // (3, 4, 6,... - are non vg columns)
            // and we need to move 1 --> 3, so the result orders will be [c1=5,c2=1,c3=2]. non vg column orders won't be touched.
            if (fromIndex < toIndex) {
                var previousOrder = activeFieldsSorted[fromIndex].order;
                for (var j = fromIndex + 1; j <= toIndex; j++) {
                    var order = activeFieldsSorted[j].order;
                    activeFieldsSorted[j].order = previousOrder;
                    previousOrder = order;
                }
                activeFieldsSorted[fromIndex].order = previousOrder;
            }
            else {
                var nextOrder = activeFieldsSorted[fromIndex].order;
                for (var j = fromIndex - 1; j >= toIndex; j--) {
                    var order = activeFieldsSorted[j].order;
                    activeFieldsSorted[j].order = nextOrder;
                    nextOrder = order;
                }
                activeFieldsSorted[fromIndex].order = nextOrder;
            }
        };
        IzendaInstantReportStorageService.prototype.getPreviewSplashVisible = function () {
            return this.isPreviewSplashVisible;
        };
        IzendaInstantReportStorageService.prototype.getPreviewSplashText = function () {
            return this.previewSplashText;
        };
        IzendaInstantReportStorageService.prototype.hasAggregateFormats = function () {
            if (!this.activeCheckedFields)
                return false;
            var aggregateFormats = [
                'PercentOfGroup',
                'PercentOfGroupWithRounding',
                'Gauge',
                'GaugeVariable',
                'GaugeDashboard'
            ];
            for (var i = 0; i < this.activeCheckedFields.length; i++) {
                var field = this.activeCheckedFields[i];
                if (!field || !field.format || !field.format.value)
                    continue;
                if (aggregateFormats.indexOf(field.format.value) >= 0)
                    return true;
            }
            return false;
        };
        /**
         * Restore default color settings.
         */
        IzendaInstantReportStorageService.prototype.restoreDefaultColors = function () {
            var style = this.reportSet.options.style;
            var settings = this.$izendaInstantReportSettingsService.getSettings();
            style.borderColor = settings.reportBorderColor;
            style.headerColor = settings.reportHeaderColor;
            style.headerForecolor = settings.headerForegroundColor;
            style.itemColor = settings.reportItemColor;
            style.itemForeColor = settings.itemForegroundColor;
            style.itemAltColor = settings.reportAlternatingItemColor;
        };
        /**
         * Get default field format (based on field typegroup)
         * @param {object} field Field.
         */
        IzendaInstantReportStorageService.prototype.getDefaultFieldFormat = function (typeGroup) {
            var formatKey;
            switch (typeGroup) {
                case 'Numeric':
                    formatKey = '{0:#,0}';
                    break;
                case 'Real':
                    formatKey = '{0:#,0.00}';
                    break;
                case 'Money':
                    formatKey = '{0:C2}';
                    break;
                case 'DateTime':
                    formatKey = '{0:d}';
                    break;
                default:
                    formatKey = '{0}';
            }
            return formatKey;
        };
        Object.defineProperty(IzendaInstantReportStorageService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaInstantReportStorageService.register = function (module) {
            module
                .constant('izendaInstantReportObjectDefaults', {
                reportName: null,
                reportCategory: null,
                dataSources: [],
                charts: [],
                filters: [],
                filterOptions: {
                    require: 'None',
                    filterLogic: ''
                },
                drillDownFields: [],
                options: {
                    usesHiddenColumns: false,
                    rowsRange: null,
                    distinct: true,
                    showFiltersInReportDescription: false,
                    isSubtotalsEnabled: false,
                    exposeAsDatasource: false,
                    hideGrid: false,
                    top: '',
                    previewTop: 100,
                    imageAlign: 'L',
                    title: '',
                    titleAlign: 'L',
                    description: '',
                    descriptionAlign: 'L',
                    headerAndFooter: {
                        reportHeader: '',
                        reportHeaderAlign: 'L',
                        reportFooter: '',
                        reportFooterAlign: 'L',
                        pageHeader: ''
                    },
                    style: {
                        borderColor: '#ffffff',
                        headerColor: '#483d8b',
                        headerForecolor: '#ffffff',
                        itemColor: '#ffffff',
                        itemForeColor: '#000000',
                        itemAltColor: '#dcdcdc',
                        isHeadersBold: false,
                        isHeadersItalic: false,
                        customCss: ''
                    },
                    page: {
                        landscapePrinting: false,
                        showPageNumber: false,
                        showDateAndTime: false,
                        usePagination: true,
                        itemsPerPage: 10000,
                        addBookmarkForVg: false,
                        pageBreakAfterVg: false,
                        minimizeGridWidth: true,
                        enableResponsiveGrid: true,
                        vgStyle: 'CommaDelimited',
                        pivotsPerPage: '',
                        splitAllColumns: false,
                        pageBreakOnSplit: false
                    }
                },
                isFieldsAutoGrouped: false
            })
                .constant('izendaFilterObjectDefaults', {
                initialized: false,
                field: null,
                required: false,
                description: '',
                parameter: true,
                operatorString: '',
                operator: null,
                operators: [],
                existentValues: [],
                values: [],
                titleFormat: null,
                titleFormats: [],
                isValid: true,
                validationMessages: [],
                validationMessageString: '',
                customPopupTemplateUrl: null,
                isFilterReady: false
            })
                .constant('izendaDefaultFunctionObject', {
                dataType: 'Unknown',
                dataTypeGroup: 'None',
                isScalar: '0',
                sqlTemplate: '{0}',
                text: '...',
                value: 'None',
                group: ''
            })
                .constant('izendaDefaultSubtotalFunctionObject', {
                dataType: 'Unknown',
                dataTypeGroup: 'None',
                isScalar: '0',
                sqlTemplate: '{0}',
                text: '(Default)',
                value: 'DEFAULT',
                group: ''
            })
                .constant('izendaDefaultFormatObject', {
                text: '...',
                value: '{0}',
                group: ''
            })
                .service('$izendaInstantReportStorageService', IzendaInstantReportStorageService.injectModules.concat(IzendaInstantReportStorageService));
        };
        return IzendaInstantReportStorageService;
    }());
    exports.default = IzendaInstantReportStorageService;
});
izendaRequire.define("instant-report/services/instant-report-validation", ["require", "exports", "angular", "izenda-external-libs"], function (require, exports, angular) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaInstantReportValidationService = /** @class */ (function () {
        function IzendaInstantReportValidationService($izendaLocaleService, $izendaInstantReportStorageService, $izendaInstantReportPivotService, $izendaInstantReportSettingsService, $izendaCompatibilityService) {
            this.$izendaLocaleService = $izendaLocaleService;
            this.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            this.$izendaInstantReportPivotService = $izendaInstantReportPivotService;
            this.$izendaInstantReportSettingsService = $izendaInstantReportSettingsService;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.validation = {
                isValid: true,
                messages: []
            };
            this.binaryFieldsArray = ['Null', 'Unknown', 'Binary', 'VarBinary', 'Text', 'Image'];
        }
        Object.defineProperty(IzendaInstantReportValidationService, "injectModules", {
            get: function () {
                return [
                    '$izendaLocaleService',
                    '$izendaInstantReportStorageService',
                    '$izendaInstantReportPivotService',
                    '$izendaInstantReportSettingsService',
                    '$izendaCompatibilityService'
                ];
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Is report valid getter
         * @returns {boolean}
         */
        IzendaInstantReportValidationService.prototype.isReportValid = function () {
            return this.validation.isValid;
        };
        /**
         * Validation object getter
         * @returns {object}
         */
        IzendaInstantReportValidationService.prototype.getValidation = function () {
            return this.validation;
        };
        /**
         * Get list of validation messages
         * @returns {Array}.
         */
        IzendaInstantReportValidationService.prototype.getValidationMessages = function () {
            return this.validation.messages;
        };
        /**
         * Validate pivots.
         */
        IzendaInstantReportValidationService.prototype.validatePivots = function () {
            var pivotColumn = this.$izendaInstantReportPivotService.getPivotColumn();
            var pivotCells = this.$izendaInstantReportPivotService.getCellValues();
            // check if pivot column was set:
            if (angular.isObject(pivotColumn)) {
                if (!pivotCells || !pivotCells.length) {
                    // show warning when pivot cells wasn't added.
                    this.validation.isValid = false;
                    this.validation.messages.push({
                        type: 'info',
                        text: this.$izendaLocaleService.localeText('js_AddPivotCellsWarning', 'You should add pivot cells to enable pivot view.')
                    });
                }
                else {
                    var havePivotCells = pivotCells.some(function (p) { return angular.isObject(p); });
                    if (!havePivotCells) {
                        this.validation.isValid = false;
                        this.validation.messages.push({
                            type: 'info',
                            text: this.$izendaLocaleService.localeText('js_SpecifyPivotColumnWarning', 'You should specify column for at least one pivot cell (pivot cells without column will be ignored).')
                        });
                    }
                }
            }
        };
        /**
         * Clear all validation messages and state
         */
        IzendaInstantReportValidationService.prototype.clearValidation = function () {
            this.validation.isValid = true;
            this.validation.messages = [];
        };
        /**
         * Return existing validation actions
         */
        IzendaInstantReportValidationService.prototype.getValidationActions = function () {
            return this.validation.messages
                .map(function (m) { return m.additionalActionType; })
                .filter(function (a) { return !!a; });
        };
        /**
         * Validate report set
         * @returns {boolean} report is valid
         */
        IzendaInstantReportValidationService.prototype.validateReportSet = function () {
            var _this = this;
            this.clearValidation();
            var pivotColumn = this.$izendaInstantReportPivotService.getPivotColumn();
            var activeFields = this.$izendaInstantReportStorageService.getAllFieldsInActiveTables();
            var options = this.$izendaInstantReportStorageService.getOptions();
            // try to find at least one active field
            var binaryFields = [];
            var hasActiveFields = false;
            activeFields.forEach(function (field) {
                hasActiveFields = hasActiveFields || field.checked;
                if (field.checked && _this.binaryFieldsArray.indexOf(field.sqlType) >= 0) {
                    binaryFields.push(field);
                }
            });
            // try to find active pivot fields
            hasActiveFields = hasActiveFields || this.$izendaInstantReportPivotService.isPivotValid();
            // create validation result for fields
            if (!hasActiveFields && !pivotColumn) {
                this.validation.isValid = false;
                this.validation.messages.push({
                    type: 'info',
                    text: this.$izendaLocaleService.localeText('js_YouShouldSelectField', 'You should select at least one field to see preview.')
                });
            }
            // stored procedure parameters validation
            if (!this.$izendaInstantReportStorageService.isAllSpParametersAssigned()) {
                this.validation.isValid = false;
                this.validation.messages.push({
                    type: 'info',
                    text: this.$izendaLocaleService.localeText('js_spParameterIsRequired', 'Please specify values for your stored procedure parameters in the filters.')
                });
            }
            // distinct validation
            if (this.$izendaInstantReportSettingsService.getSettings().showDistinct && options.distinct && binaryFields.length > 0) {
                var binaryFieldsString = binaryFields
                    .map(function (bField) { return "\"" + bField.name + "\" (" + bField.sqlType + ")"; })
                    .join(', ');
                this.validation.messages.push({
                    type: 'info',
                    additionalActionType: 'TURN_OFF_DISTINCT',
                    text: this.$izendaLocaleService.localeTextWithParams('js_ColumnsIsntCompatibleWithDistinct', 'Report contain columns: {0}. These columns are not compatable with "distinct" setting. Distinct setting was disabled!', [binaryFieldsString])
                });
            }
            // run pivots validation
            this.validatePivots();
            return this.validation.isValid;
        };
        ;
        /**
         * Validate report set and refresh preview.
         */
        IzendaInstantReportValidationService.prototype.validateReportSetAndRefresh = function (forceRefresh) {
            if (forceRefresh === void 0) { forceRefresh = false; }
            var validationResult = this.validateReportSet();
            var validationActions = this.getValidationActions();
            if (validationResult) {
                // report is valid
                if (validationActions.indexOf('TURN_OFF_DISTINCT') >= 0)
                    this.$izendaInstantReportStorageService.getOptions().distinct = false;
                if (forceRefresh || !this.$izendaCompatibilityService.isSmallResolution())
                    this.$izendaInstantReportStorageService.getReportPreviewHtml();
            }
            else {
                // report not valid
                this.$izendaInstantReportStorageService.clearReportPreviewHtml();
            }
        };
        Object.defineProperty(IzendaInstantReportValidationService, "$inject", {
            get: function () {
                return this.injectModules;
            },
            enumerable: true,
            configurable: true
        });
        IzendaInstantReportValidationService.register = function (module) {
            module.service('$izendaInstantReportValidationService', IzendaInstantReportValidationService.injectModules.concat(IzendaInstantReportValidationService));
        };
        return IzendaInstantReportValidationService;
    }());
    exports.default = IzendaInstantReportValidationService;
});
izendaRequire.define("instant-report/directive/instant-report-field-draggable", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_24) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Item draggable directive
     */
    module_definition_24.default.directive('izendaInstantReportFieldDraggable', ['$rootScope',
        function ($rootScope) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    var handle = attrs.draggableHandle || false;
                    angular.element(elem)['draggable']({
                        handle: handle,
                        start: function () {
                            $rootScope.isDraggingNow = true;
                            $rootScope.$applyAsync();
                        },
                        stop: function () {
                            $rootScope.isDraggingNow = false;
                            $rootScope.$applyAsync();
                        },
                        helper: function (event) {
                            var $target = angular.element(this);
                            var $helper = $target.clone();
                            $helper.css({
                                'position': 'absolute',
                                'width': $target.width(),
                                'height': $target.height()
                            });
                            $helper.attr('draggable-data-id', $target.attr('draggable-data-id'));
                            return $helper;
                        },
                        cursorAt: { left: -10, top: -10 },
                        appendTo: 'body',
                        distance: 10,
                        cursor: 'move',
                        zIndex: 9999
                    });
                    scope.$parent.$watch(attrs.draggableEnabled, function (newEnabled) {
                        angular.element(elem)['draggable'](newEnabled ? 'enable' : 'disable');
                    });
                }
            };
        }
    ]);
    /**
     * Item droppable directive
     */
    module_definition_24.default.directive('izendaInstantReportFieldDroppable', [
        function () {
            return {
                restrict: 'A',
                scope: {
                    droppableAccept: '@',
                    onDrop: '&'
                },
                link: function (scope, elem, attrs) {
                    angular.element(elem)['droppable']({
                        accept: scope.droppableAccept,
                        activeClass: 'draggable-highlight',
                        hoverClass: 'draggable-highlight-hover',
                        tolerance: 'pointer',
                        drop: function (event, ui) {
                            if (angular.isFunction(scope.onDrop)) {
                                scope.onDrop({
                                    arg0: angular.element(ui.helper).attr('draggable-data-id')
                                });
                            }
                        }
                    });
                }
            };
        }
    ]);
});
izendaRequire.define("instant-report/directive/instant-report-left-panel-resize", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_25) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var IzendaInstantReportLeftPanelResizeDirective = /** @class */ (function () {
        function IzendaInstantReportLeftPanelResizeDirective($window, $izendaCompatibilityService) {
            var _this = this;
            this.$window = $window;
            this.$izendaCompatibilityService = $izendaCompatibilityService;
            this.restrict = 'A';
            this.scope = {
                leftPanelSelector: '@',
                mainPanelSelector: '@',
                opened: '='
            };
            IzendaInstantReportLeftPanelResizeDirective.prototype.link = function ($scope, $element) {
                var getWidth = function ($el) {
                    var elWidth = $el.width();
                    var styleData = String($el.attr('data-style'));
                    var styleString = styleData ? styleData : String($el.attr('style'));
                    if (styleString) {
                        // find "width: NNNpx" items and parse it.
                        styleString.split(';')
                            .filter(function (x) { return x && x.trim().indexOf('width') === 0; })
                            .forEach(function (x) {
                            var widthArray = x.split(':');
                            var widthString = widthArray[1].trim();
                            var initialValue = elWidth;
                            elWidth = parseInt(widthString.substring(0, widthString.length - 2));
                            if (isNaN(elWidth))
                                elWidth = initialValue;
                        });
                    }
                    return elWidth;
                };
                var applyCustomEvent = function () {
                    if (!_this.$izendaCompatibilityService.isIe()) {
                        _this.$window.dispatchEvent(new Event('izendaCustomResize'));
                    }
                    else {
                        var evt = document.createEvent('UIEvents');
                        evt.initUIEvent('resize', true, false, window, 0);
                        window.dispatchEvent(evt);
                    }
                };
                $scope.$izendaCompatibilityService = _this.$izendaCompatibilityService;
                var $elem = angular.element($element);
                var $left = angular.element($scope.leftPanelSelector);
                var $main = angular.element($scope.mainPanelSelector);
                var isLeftInitialized = false;
                var isMainInitialized = false;
                // initialize jquery objects
                var initializeElements = function () {
                    if (!isLeftInitialized) {
                        $left = angular.element($scope.leftPanelSelector);
                        isLeftInitialized = $left.length > 0;
                    }
                    if (!isMainInitialized) {
                        $main = angular.element($scope.mainPanelSelector);
                        isMainInitialized = $main.length > 0;
                    }
                };
                var initStyles = function ($el) {
                    var width = getWidth($el);
                    var leftStyle = "width: " + width + "px";
                    var mainStyle = "margin-left: " + (width + 4) + "px";
                    $elem.attr('style', "width: " + width + "px");
                    $elem.attr('data-style', "left: " + width + "px");
                    $left.attr('style', leftStyle);
                    $left.attr('data-style', leftStyle);
                    $main.attr('style', mainStyle);
                    $main.attr('data-style', mainStyle);
                };
                // initialize draggable
                var windowWidth = angular.element(_this.$window).width();
                $elem['draggable']({
                    axis: 'x',
                    zIndex: 2,
                    containment: [350, 0, Math.min(1500, windowWidth - 500), 0],
                    drag: function (event, ui) {
                        initializeElements();
                        var currentLeftStyle = "width: " + ui.position.left + "px";
                        var currentMainStyle = "margin-left: " + (ui.position.left + 4) + "px";
                        $elem.attr('data-style', "left: " + ui.position.left + "px");
                        $left.attr('style', currentLeftStyle);
                        $left.attr('data-style', currentLeftStyle);
                        $main.attr('style', currentMainStyle);
                        $main.attr('data-style', currentMainStyle);
                        applyCustomEvent();
                    }
                });
                initializeElements();
                initStyles($left);
                // open/close left panel handler
                $scope.$watch('opened', function (newOpened) {
                    initializeElements();
                    var isMobileView = _this.$izendaCompatibilityService.isSmallResolution();
                    var collapsedLeft = isMobileView ? 48 : 128;
                    var width = getWidth($left);
                    if (newOpened) {
                        var dataStyleLeft = String($left.attr('data-style')) || "width: " + (isMobileView ? '100%' : width + 'px');
                        var dataStyleMain = String($main.attr('data-style')) || "margin-left: " + (width + 4) + "px;";
                        var dataStyleElem = String($elem.attr('data-style')) || "left: " + width + "px;";
                        $left.attr('style', dataStyleLeft);
                        $main.attr('style', dataStyleMain);
                        $element.attr('style', dataStyleElem);
                    }
                    else {
                        $left.attr('style', "width: " + collapsedLeft + "px;");
                        $main.attr('style', "margin-left: " + collapsedLeft + "px;");
                        $element.attr('style', 'left: -4px;');
                    }
                    applyCustomEvent();
                });
            };
        }
        IzendaInstantReportLeftPanelResizeDirective.factory = function () {
            var directive = function ($window, $izendaCompatibilityService) {
                return new IzendaInstantReportLeftPanelResizeDirective($window, $izendaCompatibilityService);
            };
            directive.$inject = ['$window', '$izendaCompatibilityService'];
            return directive;
        };
        return IzendaInstantReportLeftPanelResizeDirective;
    }());
    module_definition_25.default.directive('izendaInstantReportLeftPanelResize', [
        '$window', '$izendaCompatibilityService', IzendaInstantReportLeftPanelResizeDirective.factory()
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-charts-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_26) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report charts controller definition
     */
    module_definition_26.default.controller('InstantReportChartsController', [
        '$rootScope',
        '$scope',
        '$window',
        '$timeout',
        '$q',
        '$izendaUrlService',
        '$izendaLocaleService',
        '$izendaCompatibilityService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportVisualizationService',
        '$izendaInstantReportValidationService',
        '$log',
        function ($rootScope, $scope, $window, $timeout, $q, $izendaUrlService, $izendaLocaleService, $izendaCompatibilityService, $izendaInstantReportStorageService, $izendaInstantReportVisualizationService, $izendaInstantReportValidationService, $log) {
            'use strict';
            var vm = this;
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            $scope.$izendaInstantReportVisualizationService = $izendaInstantReportVisualizationService;
            vm.visualizationConfig = $izendaInstantReportVisualizationService.getVisualizationConfig();
            vm.selectedChart = null;
            /**
             * Select chart
             */
            vm.selectChart = function (chart) {
                if (vm.selectedChart === chart) {
                    vm.selectedChart = null;
                    $izendaInstantReportStorageService.selectChart(null);
                    if (!$izendaCompatibilityService.isSmallResolution())
                        $izendaInstantReportValidationService.validateReportSetAndRefresh();
                }
                else {
                    vm.selectedChart = chart;
                    $izendaInstantReportStorageService.selectChart(chart);
                    if (!$izendaCompatibilityService.isSmallResolution())
                        $izendaInstantReportValidationService.validateReportSetAndRefresh();
                }
            };
            /**
             * Prepare config
             */
            vm.prepareConfig = function () {
                if (!angular.isObject(vm.visualizationConfig))
                    return;
                if (!angular.isArray(vm.visualizationConfig.categories))
                    return;
                angular.element.each(vm.visualizationConfig.categories, function (iCategory, category) {
                    category.opened = iCategory === 0;
                });
            };
            /**
             * Open new window with chart help
             * @param {object} chart object
             */
            vm.showChartHelp = function (chart) {
                if (!angular.isObject(chart))
                    throw 'Chart parameter should be object';
                $window.open(chart.docUrl, '_blank');
            };
            /**
            * Initialize controller
            */
            vm.init = function () {
                $scope.$watch('$izendaInstantReportVisualizationService.getVisualizationConfig()', function (visConfig) {
                    vm.visualizationConfig = visConfig;
                    vm.prepareConfig();
                });
                $scope.$watch('$izendaInstantReportStorageService.getSelectedChart()', function (chart) {
                    vm.selectedChart = chart;
                });
            };
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-columns-sort-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_27) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report filters controller
     */
    module_definition_27.default.controller('InstantReportColumnsSortController', [
        '$rootScope',
        '$scope',
        '$window',
        '$timeout',
        '$q',
        '$sce',
        '$log',
        '$izendaLocaleService',
        '$izendaCompatibilityService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportValidationService',
        function ($rootScope, $scope, $window, $timeout, $q, $sce, $log, $izendaLocaleService, $izendaCompatibilityService, $izendaInstantReportStorageService, $izendaInstantReportValidationService) {
            'use strict';
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            var vm = this;
            //vm.panelOpened = false;
            vm.activeFields = $izendaInstantReportStorageService.getAllActiveFields();
            vm.columnReordered = function (fromIndex, toIndex, isVisualGroupColumn) {
                $izendaInstantReportStorageService.moveFieldToPosition(fromIndex, toIndex, isVisualGroupColumn, false);
                if (!$izendaCompatibilityService.isSmallResolution())
                    $izendaInstantReportValidationService.validateReportSetAndRefresh();
                $scope.$applyAsync();
            };
            vm.columnSelected = function (field) {
                $izendaInstantReportStorageService.applyFieldSelected(field, true);
                $scope.$applyAsync();
            };
            /**
             * Initialize watches
             */
            vm.initWatchers = function () {
                $scope.$watch('$izendaInstantReportStorageService.getAllActiveFields()', function (newActiveFields) {
                    vm.activeFields = newActiveFields;
                }, true);
            };
            /**
             * Initialize controller
             */
            vm.init = function () {
            };
            vm.initWatchers();
        }
    ]);
    /**
     * Columns reorder directive
     */
    angular.module('izendaInstantReport').directive('instantReportColumnsReorder', [
        '$izendaLocaleService',
        '$izendaInstantReportStorageService',
        function ($izendaLocaleService, $izendaInstantReportStorageService) {
            return {
                restrict: 'EA',
                scope: {
                    ngItems: '=',
                    showSortButtons: '@',
                    onReorder: '&',
                    onClick: '&'
                },
                template: '<div class="izenda-reorder-header vg">' + $izendaLocaleService.localeText('js_VisGroupColumns', 'Visual group columns') + '</div>' +
                    '<ul class="izenda-reorder list-unstyled vg">' +
                    '<li class="izenda-reorder-item" ng-repeat="item in vgList" ng-bind="item.title">' +
                    '<span class="pull-right glyphicon glyphicon-arrow-up"></span>' +
                    '<span class="pull-right glyphicon glyphicon-arrow-down"></span>' +
                    '</li>' +
                    '</ul>' +
                    '<div class="izenda-reorder-header simple">' + $izendaLocaleService.localeText('js_Columns', 'Columns') + '</div>' +
                    '<ul class="izenda-reorder list-unstyled simple">' +
                    '<li class="izenda-reorder-item" ng-repeat="item in simpleList" ng-bind="item.title">' +
                    '<span class="pull-right glyphicon glyphicon-arrow-up"></span>' +
                    '<span class="pull-right glyphicon glyphicon-arrow-down"></span>' +
                    '</li>' +
                    '</ul>',
                link: function (scope, element, attrs) {
                    var $vgList = element.find('.izenda-reorder.vg'), $simpleList = element.find('.izenda-reorder.simple'), $vgListHeader = element.find('.izenda-reorder-header.vg'), $simpleListHeader = element.find('.izenda-reorder-header.simple');
                    var doClick = function (field) {
                        if (field && angular.isFunction(scope.onClick))
                            scope.onClick({ field: field });
                    };
                    /**
                     * Call reorder handler
                     */
                    var doReorder = function (startPosition, endPosition, isVg) {
                        if (angular.isFunction(scope.onReorder))
                            scope.onReorder({
                                arg0: startPosition,
                                arg1: endPosition,
                                arg2: isVg
                            });
                    };
                    /**
                     * Sort handler
                     */
                    var sortUpdateHandler = function (event, ui) {
                        var $elem = ui.item, $parent = $elem.closest('.izenda-reorder');
                        var startPosition = parseInt($elem.attr('data-order'));
                        var endPosition = $elem.index();
                        // update indexes
                        $parent.children().each(function (i) {
                            angular.element(this).attr('data-order', i);
                        });
                        doReorder(startPosition, endPosition, $parent.hasClass('vg'));
                    };
                    /**
                     * Prepare data and update sortable
                     */
                    var prepare = function (items) {
                        // prepare lists
                        var vgList = [], simpleList = [];
                        if (angular.isArray(items)) {
                            for (var i = 0; i < items.length; i++) {
                                var item = items[i];
                                if (item.isVgUsed)
                                    vgList.push(item);
                                else
                                    simpleList.push(item);
                            }
                        }
                        vgList.sort(function (a, b) {
                            return a.order - b.order;
                        });
                        simpleList.sort(function (a, b) {
                            return a.order - b.order;
                        });
                        // create elements:
                        if (vgList.length > 0) {
                            $vgListHeader.show();
                            $vgList.show();
                            $vgList.empty();
                            angular.element.each(vgList, function (i) {
                                var table = $izendaInstantReportStorageService.getTableById(this.parentId);
                                var $el = angular.element('<li class="izenda-reorder-item"></li>');
                                $el.attr('data-order', i);
                                $vgList.append($el);
                                var $span = angular.element('<span class="izenda-reorder-item-text"></span>');
                                $span.text(table.name + ' → ' + (this.description !== '' ? this.description : this.name));
                                $span.on('click', function () {
                                    doClick(vgList[i]);
                                });
                                $el.append($span);
                                if (scope.showSortButtons) {
                                    var $arrowUp = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn1" title="' +
                                        $izendaLocaleService.localeText('js_MoveColumnUp', 'Move column up') + '"><span class="glyphicon glyphicon-arrow-up"></span></span>');
                                    $el.append($arrowUp);
                                    $arrowUp.on('click', function () {
                                        var index = angular.element(this).closest('.izenda-reorder-item').index();
                                        if (index > 0) {
                                            doReorder(index, index - 1, true);
                                        }
                                    });
                                    var $arrowDown = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn2" title="' +
                                        $izendaLocaleService.localeText('js_MoveColumnDown', 'Move column down') + '"><span class="glyphicon glyphicon-arrow-down"></span></span>');
                                    $el.append($arrowDown);
                                    $arrowDown.on('click', function () {
                                        var index = angular.element(this).closest('.izenda-reorder-item').index();
                                        if (index < vgList.length - 1) {
                                            doReorder(index, index + 1, true);
                                        }
                                    });
                                }
                            });
                            $vgList['sortable']('refresh');
                        }
                        else {
                            $vgListHeader.hide();
                            $vgList.hide();
                            $vgList.empty();
                        }
                        if (simpleList.length > 0) {
                            if (vgList.length > 0)
                                $simpleListHeader.show();
                            else
                                $simpleListHeader.hide();
                            $simpleList.show();
                            $simpleList.empty();
                            angular.element.each(simpleList, function (i) {
                                var table = $izendaInstantReportStorageService.getTableById(this.parentId);
                                var $el = angular.element('<li class="izenda-reorder-item"></li>');
                                $el.attr('data-order', i);
                                $simpleList.append($el);
                                var $span = angular.element('<span class="izenda-reorder-item-text"></span>');
                                $span.text(table.name + ' → ' + (this.description !== '' ? this.description : this.name));
                                $span.on('click', function () {
                                    doClick(simpleList[i]);
                                });
                                $el.append($span);
                                if (scope.showSortButtons) {
                                    var $arrowUp = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn1" title="' +
                                        $izendaLocaleService.localeText('js_MoveColumnUp', 'Move column up') + '"><span class="glyphicon glyphicon-arrow-up"></span></span>');
                                    $el.append($arrowUp);
                                    $arrowUp.on('click', function () {
                                        var index = angular.element(this).closest('.izenda-reorder-item').index();
                                        if (index > 0) {
                                            doReorder(index, index - 1, false);
                                        }
                                    });
                                    var $arrowDown = angular.element('<span class="ds-multiple-button izenda-reorder-item-btn2" title="' +
                                        $izendaLocaleService.localeText('js_MoveColumnDown', 'Move column down') + '"><span class="glyphicon glyphicon-arrow-down"></span></span>');
                                    $el.append($arrowDown);
                                    $arrowDown.on('click', function () {
                                        var index = angular.element(this).closest('.izenda-reorder-item').index();
                                        if (index < simpleList.length - 1) {
                                            doReorder(index, index + 1, false);
                                        }
                                    });
                                }
                            });
                            $simpleList['sortable']('refresh');
                        }
                        else {
                            $simpleListHeader.hide();
                            $simpleList.hide();
                            $simpleList.empty();
                        }
                    };
                    // initialize
                    $vgList['sortable']({
                        update: sortUpdateHandler,
                        axis: 'y'
                    });
                    $vgList['disableSelection']();
                    $simpleList['sortable']({
                        update: sortUpdateHandler,
                        axis: 'y'
                    });
                    $simpleList['disableSelection']();
                    prepare(scope.ngItems);
                    // watch for updates
                    scope.$watch('ngItems', function (newVal) {
                        prepare(newVal);
                    }, true);
                }
            };
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_28) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report controller definition
     */
    module_definition_28.default.controller('InstantReportController', [
        '$rootScope',
        '$scope',
        '$window',
        '$timeout',
        '$cookies',
        '$q',
        '$log',
        '$izendaUtilUiService',
        '$izendaUrlService',
        '$izendaLocaleService',
        '$izendaSettingsService',
        '$izendaCompatibilityService',
        '$izendaScheduleService',
        '$izendaShareService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportPivotService',
        '$izendaInstantReportValidationService',
        '$izendaInstantReportSettingsService',
        function ($rootScope, $scope, $window, $timeout, $cookies, $q, $log, $izendaUtilUiService, $izendaUrlService, $izendaLocaleService, $izendaSettingsService, $izendaCompatibilityService, $izendaScheduleService, $izendaShareService, $izendaInstantReportStorageService, $izendaInstantReportPivotService, $izendaInstantReportValidationService, $izendaInstantReportSettingsService) {
            'use strict';
            var vm = this;
            var UNCATEGORIZED = $izendaLocaleService.localeText('js_Uncategorized', 'Uncategorized');
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            $scope.$izendaInstantReportPivotService = $izendaInstantReportPivotService;
            $scope.$izendaInstantReportValidationService = $izendaInstantReportValidationService;
            $scope.$izendaUrlService = $izendaUrlService;
            $scope.$izendaLocaleService = $izendaLocaleService;
            $scope.$izendaCompatibilityService = $izendaCompatibilityService;
            $scope.$izendaScheduleService = $izendaScheduleService;
            $scope.$izendaShareService = $izendaShareService;
            vm.isSmallResolution = $izendaCompatibilityService.isSmallResolution();
            vm.isSaveReportModalOpened = false;
            vm.isLoading = true;
            vm.previewHtml = $izendaInstantReportStorageService.getPreview();
            vm.reportSetOptions = {
                isVgUsed: false,
                vgStyle: null,
                sortedActiveFields: []
            };
            ;
            vm.filtersPanelOpened = $izendaInstantReportStorageService.getFiltersPanelOpened();
            vm.pivotsPanelOpened = $izendaInstantReportPivotService.getPivotsPanelOpened();
            vm.isValid = true;
            vm.activeField = null;
            vm.filtersCount = $izendaInstantReportStorageService.getFilters().length;
            vm.pivotCellsCount = $izendaInstantReportPivotService.getCellValues().length;
            vm.top = $izendaInstantReportStorageService.getOptions().top;
            vm.previewTop = $izendaInstantReportStorageService.getOptions().previewTop;
            vm.activeFields = $izendaInstantReportStorageService.getAllActiveFields();
            vm.settings = $izendaInstantReportSettingsService.getSettings();
            vm.reportInfo = null;
            vm.isExistingReport = false;
            vm.currentInsertColumnOrder = -1; // used for select field position for drag'n'drop fields
            // Left panel state object
            var previewPanelId = 6;
            vm.leftPanel = {
                activeItem: 0,
                previousPanelId: 0,
                opened: true
            };
            vm.exportProgress = null;
            vm.effectiveRights = $izendaCompatibilityService.getRights();
            _updateReportSetRightVariables();
            /**
             * Wait message header for export and print
             */
            vm.getWaitMessageHeaderText = function () {
                if (vm.exportProgress === 'export') {
                    return $izendaLocaleService.localeText('js_ExportingInProgress', 'Exporting in progress.');
                }
                if (vm.exportProgress === 'print') {
                    return $izendaLocaleService.localeText('js_PrintingInProgress', 'Printing in progress.');
                }
                return '';
            };
            /**
             * Wait message for export and print
             */
            vm.getWaitMessageText = function () {
                if (vm.exportProgress === 'export') {
                    return $izendaLocaleService.localeText('js_FinishExporting', 'Please wait till export is completed...');
                }
                if (vm.exportProgress === 'print') {
                    return $izendaLocaleService.localeText('js_FinishPrinting', 'Please finish printing before continue.');
                }
                return '';
            };
            /**
             * Set active panel
             */
            vm.setLeftPanelActiveItem = function (id) {
                vm.leftPanel.activeItem = id;
                if (id !== previewPanelId)
                    vm.leftPanel.previousPanelId = id;
                vm.leftPanel.opened = true;
            };
            /**
             * Open report designer.
             */
            vm.openReportInDesigner = function () {
                $izendaInstantReportStorageService.openReportInDesigner();
            };
            /**
             * Refresh preview
             */
            vm.applyChanges = function () {
                vm.updateReportSetValidationAndRefresh();
            };
            /**
             * Refresh preview for mobile devices
             */
            vm.applyChangesMobile = function () {
                if (vm.leftPanel.previousPanelId === vm.leftPanel.activeItem) {
                    vm.setLeftPanelActiveItem(6);
                    vm.updateReportSetValidationAndRefresh(true);
                    //$izendaInstantReportValidationService.validateReportSetAndRefresh();
                }
                else {
                    vm.setLeftPanelActiveItem(vm.leftPanel.previousPanelId);
                    vm.leftPanel.previousPanelId = vm.leftPanel.activeItem;
                }
            };
            /**
             * Set preview value
             */
            vm.setPreviewTop = function (value) {
                $izendaInstantReportStorageService.setPreviewTop(value);
                vm.applyChanges();
                vm.closeAllNavbars();
            };
            /**
             * Returns active class for panel
             */
            vm.getLeftPanelClass = function (id) {
                var result = vm.isExistingReport ? 'has-title' : '';
                if (vm.isLeftPanelBodyActive(id))
                    result += ' active';
                return result.trim();
            };
            /**
             * Get class for mobile view
             */
            vm.getMobileClass = function () {
                return vm.isSmallResolution ? ' iz-inst-mobile ' : '';
            };
            /**
             * returns true only for active panel in left panel
             */
            vm.isLeftPanelBodyActive = function (id) {
                return vm.leftPanel.activeItem === id;
            };
            /**
             * Hide/show left panel
             */
            vm.toggleLeftPanel = function () {
                vm.leftPanel.opened = !vm.leftPanel.opened;
            };
            /**
             * Get toggle left panel button title
             */
            vm.getToggleButtonTitle = function () {
                if (vm.leftPanel.opened)
                    return $izendaLocaleService.localeText('js_HideLeftPanel', 'Hide left panel');
                else
                    return $izendaLocaleService.localeText('js_ShowLeftPanel', 'Show left panel');
            };
            /**
             * Handler column drag/drop reorder
             */
            vm.columnReordered = function (fromIndex, toIndex, isVg) {
                // we need to understand that swap from <-> to doesn't take into concideration invisible fields.
                $izendaInstantReportStorageService.moveFieldToPosition(fromIndex, toIndex, isVg, true);
                vm.updateReportSetValidationAndRefresh();
                $scope.$applyAsync();
            };
            /**
             * Get columns, allowed for reorder
             * @returns {number} count of columns which allowed for reorder.
             */
            vm.getAllowedColumnsForReorder = function () {
                return vm.activeFields.length;
            };
            /**
             * Column selected
             */
            vm.selectedColumn = function (field) {
                $izendaInstantReportStorageService.unselectAllFields();
                field.selected = true;
                $izendaInstantReportStorageService.setCurrentActiveField(field);
                $scope.$applyAsync();
            };
            /**
             * Remove column by given index
             * @param {number} index
             */
            vm.removeColumn = function (field) {
                if (!angular.isNumber(field.parentFieldId)) {
                    // if it is not multiple column for one database field.
                    $izendaInstantReportStorageService.applyFieldChecked(field).then(function () {
                        var selectedField = $izendaInstantReportStorageService.getCurrentActiveField();
                        if (selectedField === field)
                            $izendaInstantReportStorageService.applyFieldSelected(field, false);
                        vm.updateReportSetValidationAndRefresh();
                        $scope.$applyAsync();
                    });
                }
                else {
                    var parentField = $izendaInstantReportStorageService.getFieldById(field.parentFieldId);
                    $izendaInstantReportStorageService.removeAnotherField(parentField, field);
                    vm.updateReportSetValidationAndRefresh();
                    $scope.$applyAsync();
                }
            };
            /**
             * Open filters modal dialog
            */
            vm.openFiltersPanel = function (value) {
                $izendaInstantReportPivotService.setPivotsPanelOpened(false);
                if (angular.isDefined(value)) {
                    $izendaInstantReportStorageService.setFiltersPanelOpened(value);
                }
                else {
                    var opened = $izendaInstantReportStorageService.getFiltersPanelOpened();
                    $izendaInstantReportStorageService.setFiltersPanelOpened(!opened);
                }
            };
            /**
             * Open pivots panel
             */
            vm.openPivotsPanel = function (value) {
                $izendaInstantReportStorageService.setFiltersPanelOpened(false);
                if (angular.isDefined(value)) {
                    $izendaInstantReportPivotService.setPivotsPanelOpened(value);
                }
                else {
                    var opened = $izendaInstantReportPivotService.getPivotsPanelOpened();
                    $izendaInstantReportPivotService.setPivotsPanelOpened(!opened);
                }
            };
            /**
             * Open filters panel and add filter
             */
            vm.addFilter = function (fieldSysName) {
                if (!angular.isString(fieldSysName))
                    return;
                if ($izendaInstantReportStorageService.getActiveTables().length === 0)
                    return;
                vm.openFiltersPanel(true);
                $izendaInstantReportStorageService.createNewFilter(fieldSysName).then(function (filter) {
                    $izendaInstantReportStorageService.getFilters().push(filter);
                    filter.initialized = true;
                    $izendaInstantReportValidationService.validateReportSet();
                    $izendaInstantReportStorageService.setFilterOperator(filter, null).then(function () {
                        $scope.$applyAsync();
                    });
                });
            };
            /**
             * Open pivots panel and add pivot item
             */
            vm.addPivotItem = function (fieldSysName) {
                if (!angular.isString(fieldSysName))
                    return;
                if ($izendaInstantReportStorageService.getActiveTables().length === 0)
                    return;
                vm.openPivotsPanel(true);
                var field = $izendaInstantReportStorageService.getFieldBySysName(fieldSysName);
                var newItem = $izendaInstantReportStorageService.createFieldObject(field.name, field.parentId, field.tableSysname, field.tableName, field.sysname, field.typeGroup, field.type, field.sqlType);
                $izendaInstantReportStorageService.initializeField(newItem).then(function (f) {
                    $scope.$applyAsync();
                });
                $izendaInstantReportPivotService.addPivotItem(newItem);
                $izendaInstantReportStorageService.applyAutoGroups(true);
            };
            /**
             * Update validation state and refresh if needed.
             */
            vm.updateReportSetValidationAndRefresh = function (forceRefresh) {
                $izendaInstantReportValidationService.validateReportSetAndRefresh(forceRefresh);
            };
            /**
             * Add field to report
             */
            vm.addFieldToReport = function (fieldSysName) {
                if (!angular.isString(fieldSysName))
                    return;
                var field = $izendaInstantReportStorageService.getFieldBySysName(fieldSysName, true);
                if (field.checked) {
                    var anotherField = $izendaInstantReportStorageService.addAnotherField(field, true);
                    $izendaInstantReportStorageService.applyFieldChecked(anotherField).then(function () {
                        vm.updateReportSetValidationAndRefresh();
                        $scope.$applyAsync();
                    });
                }
                else {
                    $izendaInstantReportStorageService.unselectAllFields();
                    field.selected = true;
                    $izendaInstantReportStorageService.setCurrentActiveField(field);
                    $izendaInstantReportStorageService.applyFieldChecked(field).then(function () {
                        vm.updateReportSetValidationAndRefresh();
                        $scope.$applyAsync();
                    });
                }
                // move field from last postions to selected position if it is drag-n-drop:
                if (field.checked && vm.currentInsertColumnOrder >= 0) {
                    var fieldsArray = $izendaInstantReportStorageService.getAllVisibleFields().slice();
                    fieldsArray = angular.element.grep(fieldsArray, function (f) {
                        return !f.isVgUsed;
                    });
                    fieldsArray.sort(function (a, b) {
                        return a.order - b.order;
                    });
                    var from = fieldsArray.length - 1;
                    var to = vm.currentInsertColumnOrder;
                    $izendaInstantReportStorageService.moveFieldToPosition(from, to, false, true);
                }
                vm.currentInsertColumnOrder = -1;
            };
            /**
             * Close all navbar opened dropdowns
             */
            vm.closeAllNavbars = function () {
                var $navBar = angular.element('.iz-inst-navbar');
                $navBar.find('.navbar-nav > li.open').each(function () {
                    angular.element(this).removeClass('open');
                });
            };
            /**
             * Place dropdown to the proper position.
             */
            vm.alignNavDropdowns = function () {
                var $navbar = angular.element('.iz-inst-navbar');
                var $liList = $navbar.find('.iz-inst-nav > li.open');
                if (!$liList.length)
                    return;
                $liList.each(function () {
                    var $li = angular.element(this);
                    var liWidth = $li.width();
                    var $dropdown = $li.children('.dropdown-menu');
                    var isRightNow = $dropdown.hasClass('dropdown-menu-right');
                    var dropdownWidth = $dropdown.width();
                    var deltaLeft = $li.position().left + $dropdown.position().left;
                    var deltaRight = $navbar.width() - deltaLeft - dropdownWidth;
                    var isRightAlign = false;
                    var needToMove = false;
                    if (deltaRight < 0) {
                        isRightAlign = true;
                        needToMove = true;
                    }
                    if (deltaLeft < 0 || (isRightNow && deltaRight + liWidth > dropdownWidth + 10)) {
                        needToMove = true;
                        isRightAlign = false;
                    }
                    if (needToMove)
                        if (isRightAlign)
                            $dropdown.addClass('dropdown-menu-right');
                        else
                            $dropdown.removeClass('dropdown-menu-right');
                });
            };
            /**
             * Open navbar dropdown accordingly to its relative position to the edges of the screen.
             * @param {object} $event angular click event object.
             */
            vm.openNavBarDropdown = function ($event, doSync) {
                function openDropdown($li) {
                    vm.closeAllNavbars();
                    $li.addClass('open');
                    vm.alignNavDropdowns();
                }
                $event.stopPropagation();
                if (!vm.isValid)
                    return;
                // dropdown elements
                var $aElement = angular.element($event.currentTarget);
                var $liElement = $aElement.parent();
                var $dropdownElement = $aElement.siblings('.dropdown-menu');
                // close
                if ($liElement.hasClass('open')) {
                    $dropdownElement.removeClass('dropdown-menu-right');
                    $liElement.removeClass('open');
                    return;
                }
                // open
                if (doSync)
                    $izendaInstantReportStorageService.setReportSetAsCrs(false).then(function () {
                        openDropdown($liElement);
                    });
                else
                    openDropdown($liElement);
            };
            vm.isSaveButtonVisible = function () {
                return vm.settings.showSaveControls && vm.rights.isSaveAllowed && vm.activeFields.length > 0;
            };
            vm.isSaveAsButtonVisible = function () {
                return vm.settings.showSaveControls && vm.rights.isSaveAsAllowed && vm.activeFields.length > 0;
            };
            /**
             * Save dialog closed handler.
             */
            vm.onSaveClosed = function () {
                vm.isSaveReportModalOpened = false;
            };
            /**
             * Report name/category selected. Save report handler.
             */
            vm.onSave = function (reportName, categoryName) {
                _saveReportWithGivenName(reportName, categoryName);
                vm.isSaveReportModalOpened = false;
            };
            /**
             * Save report
             */
            vm.saveReport = function (forceRename) {
                vm.isSaveReportModalOpened = false;
                var rs = $izendaInstantReportStorageService.getReportSet();
                var needToRename = forceRename || !rs.reportName;
                if (needToRename) {
                    vm.isSaveReportModalOpened = true;
                }
                else {
                    _saveReportWithGivenName(rs.reportName, rs.reportCategory);
                }
                vm.closeAllNavbars();
            };
            /**
             * Print report buttons handler.
             */
            vm.printReport = function (printType) {
                vm.exportProgress = 'print';
                $timeout(function () {
                    $izendaInstantReportStorageService.printReport(printType).then(function (results) {
                        if (!results.success) {
                            var reportSet = $izendaInstantReportStorageService.getReportSet();
                            var rsReportName = reportSet.reportName;
                            // show message
                            $izendaUtilUiService.showErrorDialog($izendaLocaleService.localeTextWithParams('js_FailedPrintReport', 'Failed to print report "{0}". Error description: {1}.', [rsReportName, results.message]), $izendaLocaleService.localeText('js_FailedPrintReportTitle', 'Report print error'));
                        }
                        vm.exportProgress = null;
                    });
                    $scope.$applyAsync();
                }, 500);
                vm.closeAllNavbars();
            };
            var exportReportInternal = function (exportType) {
                vm.exportProgress = 'export';
                $izendaInstantReportStorageService.exportReport(exportType).then(function (results) {
                    if (!results.success) {
                        var reportSet = $izendaInstantReportStorageService.getReportSet();
                        var rsReportName = reportSet.reportName;
                        // show error dialog
                        $izendaUtilUiService.showErrorDialog($izendaLocaleService.localeTextWithParams('js_FailedExportReport', 'Failed to export report "{0}". Error description: {1}.', [rsReportName, results.message]), $izendaLocaleService.localeText('js_FailedExportReportTitle', 'Report export error'));
                    }
                    vm.exportProgress = null;
                });
            };
            var showCsvBulkUnsupportedFormatWarning = function (exportType) {
                var message = $izendaLocaleService.localeText('js_CsvBulkUnsupportFormatsWarning', 'Csv(bulk) export does not support following formats: percent of group, percent of group (with rounding), gauge, gauge (variable), dash gauge. Default format will be applied instead of them.');
                var checkboxes = [
                    {
                        label: $izendaLocaleService.localeText('js_DoNotShowThisDialogAgain', 'Do not show this dialog again'),
                        checked: false
                    }
                ];
                var warningArgs = {
                    title: $izendaLocaleService.localeText('js_Warning', 'Warning'),
                    message: message,
                    buttons: [
                        {
                            text: $izendaLocaleService.localeText('js_Ok', 'Ok'),
                            callback: function (checkboxes) {
                                if (checkboxes && checkboxes.length > 0) {
                                    var doNotShowAgain = checkboxes[0];
                                    if (doNotShowAgain && doNotShowAgain.checked) {
                                        var date = new Date;
                                        date.setDate(date.getDate() + 365);
                                        var cookieOptions = { expires: date };
                                        $cookies.put("izendaHideCsvBulkUnsupportedFormatWarning", true, cookieOptions);
                                    }
                                }
                                exportReportInternal(exportType);
                            }
                        },
                        { text: $izendaLocaleService.localeText('js_Cancel', 'Cancel') }
                    ],
                    checkboxes: checkboxes,
                    alertInfo: 'warning'
                };
                $izendaUtilUiService.showDialogBox(warningArgs);
            };
            var isCsvBulkWithUnsupportedFormat = function (exportType) {
                var isCsvBulk = exportType === 'csv' && $izendaSettingsService.getBulkCsv();
                if (!isCsvBulk)
                    return false;
                var hasAggregateFormats = $izendaInstantReportStorageService.hasAggregateFormats();
                return hasAggregateFormats;
            };
            /**
             * Export report buttons handler
             */
            vm.exportReport = function (exportType) {
                var hideCsvWarning = $cookies.get("izendaHideCsvBulkUnsupportedFormatWarning");
                if (isCsvBulkWithUnsupportedFormat(exportType) && !hideCsvWarning) {
                    showCsvBulkUnsupportedFormatWarning(exportType);
                    return;
                }
                exportReportInternal(exportType);
                vm.closeAllNavbars();
            };
            /**
             * on-page-click report preview handler. Raises when user clicks on paging controls in preview.
             */
            vm.onPagingClick = function (pagingControlType, pageRange) {
                var rs = $izendaInstantReportStorageService.getReportSet();
                rs.options.rowsRange = pageRange;
                $izendaInstantReportValidationService.validateReportSetAndRefresh();
            };
            /**
             * Send report link via email
             */
            vm.sendReportLinkEmail = function () {
                $izendaInstantReportStorageService.sendReportLinkEmail();
            };
            /**
             * Initialize controller
             */
            vm.init = function () {
                var applyReportInfo = function (reportInfo) {
                    if (!angular.isObject(reportInfo)) {
                        vm.isExistingReport = false;
                        vm.reportInfo = null;
                        return;
                    }
                    if (angular.isString(reportInfo.fullName) && reportInfo.fullName.trim() !== '') {
                        // if location contains report name: load it
                        $izendaInstantReportStorageService.loadReport(reportInfo.fullName).then(function () {
                            vm.isExistingReport = true;
                            vm.reportInfo = reportInfo;
                            $scope.$applyAsync();
                        });
                    }
                    else {
                        $izendaInstantReportStorageService.newReport().then(function () {
                            vm.isExistingReport = false;
                            vm.reportInfo = reportInfo;
                            $scope.$applyAsync();
                        });
                    }
                };
                $scope.$watch('$izendaCompatibilityService.isSmallResolution()', function (value, prevValue) {
                    vm.isSmallResolution = value;
                    if (vm.isSmallResolution) {
                        angular.element('.iz-inst-mainpanel-body').css('visibility', 'hidden');
                    }
                    else {
                        $timeout(function () {
                            angular.element('.iz-inst-mainpanel-body').css('visibility', 'visible');
                        }, 600);
                    }
                    if (prevValue && !value) {
                        // small -> normal
                        vm.setLeftPanelActiveItem(0);
                    }
                });
                $scope.$watch('$izendaCompatibilityService.getRights()', function (value, prevValue) {
                    if (value === prevValue)
                        return;
                    vm.effectiveRights = value;
                    _updateReportSetRightVariables();
                });
                //
                $scope.$on('changeVisualizationProperties', function (event, args) {
                    $izendaInstantReportStorageService.getReportSet().charts[0].properties = args[0];
                });
                // look for location change
                $scope.$watch('$izendaUrlService.getReportInfo()', function (reportInfo) {
                    applyReportInfo(reportInfo);
                });
                /**
                 * Listen for complete loading page.
                 */
                $scope.$watch('$izendaInstantReportStorageService.getPageReady()', function (isPageReady) {
                    if (isPageReady) {
                        vm.isLoading = false;
                        vm.updateReportSetValidationAndRefresh();
                    }
                });
                // Look for preview change
                $scope.$watch('$izendaInstantReportStorageService.getPreview()', function (previewHtml) {
                    // prepare options:
                    var options = $izendaInstantReportStorageService.getOptions();
                    vm.reportSetOptions = {
                        isVgUsed: false,
                        vgStyle: options.page.vgStyle,
                        sortedActiveFields: [],
                        pivotCellsCount: vm.pivotCellsCount
                    };
                    // add active fields.
                    vm.reportSetOptions.sortedActiveFields = $izendaInstantReportStorageService.getAllVisibleFields();
                    vm.reportSetOptions.sortedActiveFields.sort(function (a, b) {
                        return a.order - b.order;
                    });
                    angular.element.each(vm.reportSetOptions.sortedActiveFields, function () {
                        if (this.isVgUsed)
                            vm.reportSetOptions.isVgUsed = true;
                    });
                    // set preview html
                    vm.previewHtml = previewHtml;
                });
                $scope.$watch('$izendaInstantReportStorageService.getFiltersPanelOpened()', function (opened) {
                    vm.filtersPanelOpened = opened;
                });
                $scope.$watch('$izendaInstantReportPivotService.getPivotsPanelOpened()', function (opened) {
                    vm.pivotsPanelOpened = opened;
                });
                $scope.$watch('$izendaInstantReportStorageService.getCurrentActiveField()', function (field) {
                    vm.activeField = field;
                });
                $scope.$watch('$izendaInstantReportStorageService.getOptions().top', function (top) {
                    vm.top = top;
                });
                $scope.$watch('$izendaInstantReportStorageService.getOptions().previewTop', function (top) {
                    vm.previewTop = top;
                });
                $scope.$watchCollection('$izendaInstantReportStorageService.getFilters()', function (filters) {
                    vm.filtersCount = filters.length;
                });
                $scope.$watchCollection('$izendaInstantReportPivotService.getCellValues()', function (cellValues) {
                    vm.pivotCellsCount = cellValues.length;
                });
                $scope.$watchCollection('$izendaInstantReportStorageService.getAllActiveFields()', function (activeFields) {
                    vm.activeFields = activeFields;
                });
                $scope.$watch('$izendaInstantReportStorageService.getPreviewSplashVisible()', function (visible) {
                    vm.reportLoadingIndicatorIsVisible = visible;
                });
                // listen for validation state change.
                $scope.$watch('$izendaInstantReportValidationService.isReportValid()', function (isValid) {
                    vm.isValid = isValid;
                });
                /**
                 * Report name selected handler
                 */
                $scope.$on('selectedNewReportNameEvent', function (event, args) {
                    if (!angular.isArray(args) || args.length !== 2)
                        throw 'Array with 2 elements expected';
                    var name = args[0], category = args[1];
                    _saveReportWithGivenName(name, category);
                });
                // todo: move that javascript to special directive in future, because DOM manipulations in controller is bad practice:
                var $root = angular.element('.iz-inst-root');
                angular.element(window).resize(function () {
                    vm.alignNavDropdowns();
                    $root.height(angular.element(window).height() - $root.offset().top - 30);
                });
                $root.height(angular.element(window).height() - $root.offset().top - 30);
                // left panel resize sensor
                var $panel = angular.element('.iz-inst-left-panel');
                if ($panel.length)
                    resizeSensor($panel.get(0), function () {
                        vm.alignNavDropdowns();
                    });
            };
            function _updateReportSetRightVariables() {
                vm.rights = {};
                vm.rights.isFiltersEditAllowed = $izendaCompatibilityService.isFiltersEditAllowed();
                vm.rights.isFullAccess = $izendaCompatibilityService.isFullAccess();
                vm.rights.isEditAllowed = $izendaCompatibilityService.isEditAllowed();
                vm.rights.isSaveAsAllowed = $izendaCompatibilityService.isSaveAsAllowed();
                vm.rights.isSaveAllowed = $izendaCompatibilityService.isSaveAllowed();
            }
            /**
             * Save report with selected name
             */
            function _saveReportWithGivenName(reportName, reportCategory) {
                var category = reportCategory;
                if (!angular.isString(category) || category.toLowerCase() === UNCATEGORIZED.toLowerCase())
                    category = '';
                var rsReportName = reportName;
                if (angular.isString(reportCategory) && reportCategory !== '')
                    rsReportName = reportCategory + $izendaSettingsService.getCategoryCharacter() + rsReportName;
                var savePromise;
                if (angular.isString(reportName) && reportName !== '') {
                    savePromise = $izendaInstantReportStorageService.saveReportSet(reportName, category);
                }
                else {
                    savePromise = $izendaInstantReportStorageService.saveReportSet();
                }
                savePromise.then(function () {
                    var notificationMessage = $izendaLocaleService.localeTextWithParams('js_ReportSaved', 'Report "{0}" sucessfully saved.', [rsReportName]);
                    $izendaUtilUiService.showNotification(notificationMessage);
                }, function (error) {
                    var errorTitle = $izendaLocaleService.localeText('js_FailedSaveReportTitle', 'Report save error');
                    var errorMessage = $izendaLocaleService.localeTextWithParams('js_FailedSaveReport', 'Failed to save report "{0}". Error description: {1}', [rsReportName, error]);
                    $izendaUtilUiService.showErrorDialog(errorMessage, errorTitle);
                });
            }
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-data-source-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_29) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report data sources controller definition
     */
    module_definition_29.default.controller('InstantReportDataSourceController', [
        '$rootScope',
        '$scope',
        '$window',
        '$timeout',
        '$q',
        '$log',
        '$sce',
        '$anchorScroll',
        '$izendaUrlService',
        '$izendaLocaleService',
        '$izendaCompatibilityService',
        '$izendaInstantReportQueryService',
        '$izendaInstantReportPivotService',
        '$izendaInstantReportValidationService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportSettingsService',
        function ($rootScope, $scope, $window, $timeout, $q, $log, $sce, $anchorScroll, $izendaUrlService, $izendaLocaleService, $izendaCompatibilityService, $izendaInstantReportQueryService, $izendaInstantReportPivotService, $izendaInstantReportValidationService, $izendaInstantReportStorageService, $izendaInstantReportSettingsService) {
            'use strict';
            var vm = this;
            var angularJq$ = angular.element;
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            $scope.$izendaCompatibilityService = $izendaCompatibilityService;
            $scope.$izendaUrlService = $izendaUrlService;
            $scope.$izendaInstantReportSettingsService = $izendaInstantReportSettingsService;
            $scope.trustAsHtml = function (value) {
                return $sce.trustAsHtml(value);
            };
            vm.searchString = '';
            vm.dataSources = null;
            vm.isDataSourcesLoading = true;
            vm.searchResults = [];
            var previousResultsCount = null;
            vm.searchPanelOpened = false;
            vm.options = $izendaInstantReportStorageService.getOptions();
            vm.columnSortPanelOpened = false;
            vm.columnSortPanelButtonEnabled = false;
            var searchState = {
                timeoutId: null,
                changing: false
            };
            var collapseState = {
                started: false
            };
            /**
             * Collapse animation completed handler.
             */
            vm.collapseCompleted = function (collapsed) {
                collapseState.started = false;
                $scope.$applyAsync();
            };
            /**
             * Toggle opened/collapsed state.
             */
            vm.toggleItemCollapse = function (item) {
                if (!collapseState.started) {
                    collapseState.started = true;
                    item.collapsed = !item.collapsed;
                }
            };
            /**
             * Turn off search panel and reset it to default state.
             * @param {boolean} resetSearchResults. Clear search string and results.
             */
            vm.turnOffSearch = function (resetSearchResults) {
                vm.searchPanelOpened = false;
                if (resetSearchResults) {
                    angular.element('#izInstDataSourcesTree').get(0).scrollTop = 0;
                    vm.searchString = '';
                    vm.searchResults = [];
                    previousResultsCount = null;
                }
            };
            /**
             * Run search query.
             */
            vm.runSearchQuery = function (clearResults) {
                if (vm.searchQueryRunning)
                    return;
                if (!angular.isString(vm.searchString) || vm.searchString.trim() === '') {
                    vm.searchPanelOpened = false;
                    vm.searchQueryRunning = false;
                    return;
                }
                vm.searchQueryRunning = true;
                var count = 50;
                if (clearResults) {
                    vm.searchResults = [];
                    previousResultsCount = null;
                    angular.element('#izInstDataSourcesTree').get(0).scrollTop = 0;
                }
                if (previousResultsCount === 0) {
                    vm.searchQueryRunning = false;
                    return;
                }
                $izendaInstantReportStorageService.searchInDataDources(vm.searchString, vm.searchResults.length, vm.searchResults.length + count - 1).then(function (searchResults) {
                    previousResultsCount = searchResults.length;
                    angular.element.each(searchResults, function () {
                        vm.searchResults.push(this);
                    });
                    vm.searchPanelOpened = true;
                    $scope.$applyAsync();
                    vm.searchQueryRunning = false;
                });
            };
            /**
             * Get filtered datasources
             */
            vm.searchInDataDources = function () {
                if ($izendaCompatibilityService.isSmallResolution())
                    return;
                if (searchState.timeoutId !== null)
                    $timeout.cancel(searchState.timeoutId);
                searchState.timeoutId = $timeout(function () {
                    vm.runSearchQuery(true);
                }, 500);
            };
            /**
             * Get classes for category/table folder icons
             */
            vm.getFolderClass = function (item) {
                var css = '';
                if (!item.collapsed) {
                    css += ' open';
                }
                if (item.active) {
                    css += ' active';
                }
                return css.trim();
            };
            /**
             * Get classes for category/table labels
             */
            vm.getFolderLabelClass = function (item) {
                var css = '';
                if (item.active) {
                    css += ' active';
                }
                if (item.highlight) {
                    css += ' highlight';
                }
                if (!item.enabled) {
                    css += ' disabled';
                }
                if (item.selected) {
                    css += ' selected';
                }
                return css.trim();
            };
            vm.getFieldClass = function (item) {
                var css = '';
                if (item.checked) {
                    css += ' checked';
                }
                if (item.highlight) {
                    css += ' highlight';
                }
                if (!item.enabled) {
                    css += ' disabled';
                }
                return css.trim();
            };
            vm.getFieldTextClass = function (item) {
                var css = '';
                if (item.selected) {
                    css += ' selected';
                }
                return css.trim();
            };
            vm.getFieldCheckClass = function (item, ignoreFolderIcon) {
                if (!ignoreFolderIcon && item.isMultipleColumns) {
                    if (!item.collapsed)
                        return 'glyphicon-chevron-down';
                    return 'glyphicon-chevron-right';
                }
                var css = '';
                if (item.checked) {
                    css += ' glyphicon-check';
                }
                else {
                    css += ' glyphicon-unchecked';
                }
                return css.trim();
            };
            /**
             * Check if field have group
             */
            vm.isFieldGrouped = function (field) {
                return field.checked && $izendaInstantReportStorageService.isFieldGrouped(field);
            };
            /**
             * Toggle table collapsed
             * @param {object} table. Toggling table object
             */
            vm.toggleTableCollapse = function (table) {
                return $q(function (resolve) {
                    table.collapsed = !table.collapsed;
                    // if table is lazy - load fields.
                    if (table.lazy) {
                        $izendaInstantReportStorageService.loadLazyFields(table).then(function () {
                            $scope.$applyAsync();
                            resolve(table);
                        });
                    }
                    else {
                        resolve(table);
                    }
                });
            };
            /**
             * Update validation state and refresh if needed.
             */
            vm.updateReportSetValidationAndRefresh = function () {
                $izendaInstantReportValidationService.validateReportSetAndRefresh();
            };
            /**
             * Check/uncheck field.
             */
            vm.toggleFieldChecked = function (field) {
                if (!field)
                    return;
                var needToCheck = !field.checked;
                var pivotsEnabled = $izendaInstantReportPivotService.isPivotValid();
                $izendaInstantReportStorageService.applyFieldChecked(field, needToCheck, pivotsEnabled).then(function () {
                    // turn on autogroup if pivots are turned on
                    if (pivotsEnabled && needToCheck) {
                        $izendaInstantReportStorageService.applyAutoGroups(true);
                    }
                    vm.updateReportSetValidationAndRefresh();
                    $scope.$applyAsync();
                });
            };
            vm.getFieldTooltip = function (field) {
                if (!field.checked)
                    return $izendaLocaleService.localeText('js_ToggleReportField', 'Toggle report field');
                else if (!field.selected)
                    return $izendaLocaleService.localeText('js_SelectReportField', 'Select report field');
                else
                    return '';
            };
            /**
             * Check/uncheck field handler
             */
            vm.checkField = function (field, allowUncheck) {
                if (field.isMultipleColumns) {
                    vm.toggleItemCollapse(field);
                    return;
                }
                vm.selectField(field);
                // exit if field checked but we not allowed to uncheck
                if (field.checked && !allowUncheck)
                    return;
                if (!$izendaCompatibilityService.isSmallResolution()) {
                    // check field occurs in selectField function
                    vm.toggleFieldChecked(field);
                }
            };
            /**
             * Activate/deactivate table
             */
            vm.activateTable = function (table) {
                $izendaInstantReportStorageService.applyTableActive(table).then(function () {
                    vm.updateReportSetValidationAndRefresh();
                    $scope.$applyAsync();
                });
            };
            /**
             * Show field options
             */
            vm.selectField = function (field) {
                if ($izendaCompatibilityService.isSmallResolution()) {
                    vm.toggleFieldChecked(field);
                }
                else {
                    $izendaInstantReportStorageService.applyFieldSelected(field, true);
                }
            };
            /**
             * Show field options button
             */
            vm.showFieldOptions = function (field) {
                $izendaInstantReportStorageService.applyFieldSelected(field, true);
                if ($izendaCompatibilityService.isSmallResolution()) {
                    $scope.irController.setLeftPanelActiveItem(7);
                }
            };
            /**
             * Is all tables collapsed
             */
            vm.isTablesCollapsed = function (category) {
                var result = true;
                angularJq$.each(category.tables, function () {
                    if (!this.collapsed)
                        result = false;
                });
                return result;
            };
            /**
             * Collapse all tables inside category
             */
            vm.collapseCategoryTables = function (category) {
                angularJq$.each(category.tables, function () {
                    this.collapsed = true;
                });
            };
            /**
             * Add more than one same fields to report
             */
            vm.addAnotherField = function (field) {
                var anotherField = $izendaInstantReportStorageService.addAnotherField(field, true);
                vm.toggleFieldChecked(anotherField);
            };
            /**
             * Remove more than one same field
             */
            vm.removeAnotherField = function (field, multiField) {
                $izendaInstantReportStorageService.removeAnotherField(field, multiField);
                vm.updateReportSetValidationAndRefresh();
                $scope.$applyAsync();
            };
            /**
             * Open/close column sort panel
             */
            vm.openColumnsSortPanel = function (value) {
                if (angular.isDefined(value))
                    vm.columnSortPanelOpened = value;
                else {
                    vm.columnSortPanelOpened = !vm.columnSortPanelOpened;
                }
            };
            /**
             * Go to found field or table
             * @param {object} searchResultObject. Object, with table sysname and field sysname.
             */
            vm.revealSearchResult = function (searchResultObject) {
                function gotoSearchTarget(searchResult) {
                    var isField = searchResult.hasOwnProperty('fSysName');
                    var tSysName = searchResult['tSysName'];
                    if (isField) {
                        var fieldSysName = searchResult['fSysName'];
                        var field = $izendaInstantReportStorageService.getFieldBySysName(fieldSysName, true);
                        vm.selectField(field);
                        $scope.$applyAsync();
                    }
                    // scroll to element
                    $timeout(function () {
                        var tableEl = document.getElementById('anchor' + tSysName);
                        if (tableEl)
                            angular.element('#izInstDataSourcesTree').get(0).scrollTop = angular.element(tableEl).position().top;
                    }, 300);
                }
                vm.selectField(null);
                vm.turnOffSearch(true);
                $scope.$applyAsync();
                var table = $izendaInstantReportStorageService.getTableBySysname(searchResultObject['tSysName']);
                if (!table.collapsed) {
                    gotoSearchTarget(searchResultObject);
                }
                else {
                    vm.toggleTableCollapse(table).then(function () {
                        gotoSearchTarget(searchResultObject);
                    });
                }
            };
            /**
            * Initialize watchers
            */
            vm.initWatchers = function () {
                $scope.$watch(angular.bind(vm, function () {
                    return this.searchString;
                }), function () {
                    vm.searchInDataDources();
                });
                /**
                 * Look for options change
                 */
                $scope.$watch('$izendaInstantReportStorageService.getOptions()', function (options) {
                    vm.options = options;
                });
                /**
                 * Listen for complete loading page.
                 */
                $scope.$watch('$izendaInstantReportStorageService.getPageReady()', function (isPageReady) {
                    if (isPageReady) {
                        vm.isDataSourcesLoading = false;
                    }
                });
                /**
                 * Look for datasources change
                 */
                $scope.$watch('$izendaInstantReportStorageService.getDataSources()', function (datasources) {
                    vm.dataSources = datasources;
                });
                /**
                 * Look for checked fields count
                 */
                $scope.$watchCollection('$izendaInstantReportStorageService.getAllActiveFields()', function (newActiveFields) {
                    vm.columnSortPanelButtonEnabled = newActiveFields.length > 1;
                });
            };
            /**
            * Initialize controller
            */
            vm.init = function () {
            };
            // initialize with controller
            vm.initWatchers();
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-field-options-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_30) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report field options controller
     */
    module_definition_30.default.controller('InstantReportFieldOptionsController', [
        '$rootScope',
        '$scope',
        '$window',
        '$timeout',
        '$q',
        '$sce',
        '$log',
        '$izendaLocaleService',
        '$izendaCompatibilityService',
        '$izendaInstantReportQueryService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportValidationService',
        function ($rootScope, $scope, $window, $timeout, $q, $sce, $log, $izendaLocaleService, $izendaCompatibilityService, $izendaInstantReportQueryService, $izendaInstantReportStorageService, $izendaInstantReportValidationService) {
            'use strict';
            var vm = this;
            var primaryButtonClass = "izenda-common-btn-dark", activeButtonClass = "izenda-common-btn-dark active";
            $scope.$izendaLocaleService = $izendaLocaleService;
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            vm.field = null;
            vm.currentSortFunction = 'asc';
            vm.isSubtotalsEnabled = false;
            vm.drillDownStyles = $izendaInstantReportStorageService.getDrillDownStyles();
            vm.subreports = $izendaInstantReportStorageService.getSubreports();
            vm.expanded = false;
            vm.ddkValuesMaxAmount = -1;
            /**
             * Get class
             */
            vm.getPanelClass = function () {
                if ($izendaCompatibilityService.isSmallResolution())
                    return 'expanded';
                if (!angular.isObject(vm.field) || !$scope.irController.isLeftPanelBodyActive(0))
                    return 'collapsed';
                if (vm.expanded)
                    return 'expanded';
                return '';
            };
            /**
             * Get classes for validate messages icon
             */
            vm.getValidateMessageIconClass = function (message) {
                return message;
            };
            /**
             * Fires when description was set manually.
             */
            vm.onDescriptionWasSet = function () {
                $izendaInstantReportStorageService.applyDescription(vm.field);
            };
            /**
             * Fires when group was selected
             */
            vm.onFunctionSelected = function () {
                if (vm.field.groupByFunction === null)
                    return;
                $izendaInstantReportStorageService.onFieldFunctionApplied(vm.field);
            };
            /**
             * Fires when typegroup was selected
             */
            vm.onTypeGroupSelected = function () {
                $izendaInstantReportStorageService.onExpressionTypeGroupApplied(vm.field);
            };
            /**
             * Fires when expression changed.
             */
            vm.onExpressionChanged = function () {
                $izendaInstantReportStorageService.onExpressionApplied();
            };
            /**
             * Update preview
             */
            vm.applyChanges = function () {
                $izendaInstantReportValidationService.validateReportSetAndRefresh();
            };
            /**
             * Toggle label justification
             */
            vm.toggleLabelJustification = function () {
                var itemsArray = ['L', 'M', 'R', 'J', ' '];
                var idx = itemsArray.indexOf(vm.field.labelJustification);
                if (idx < itemsArray.length - 1)
                    idx++;
                else
                    idx = 0;
                vm.field.labelJustification = itemsArray[idx];
            };
            /**
             * Toggle value justification
             */
            vm.toggleValueJustification = function () {
                var itemsArray = ['L', 'M', 'R', 'J', ' '];
                var idx = itemsArray.indexOf(vm.field.valueJustification);
                if (idx < itemsArray.length - 1)
                    idx++;
                else
                    idx = 0;
                vm.field.valueJustification = itemsArray[idx];
            };
            /**
             * Get sort button class
             */
            vm.getSortButtonClass = function () {
                if (!vm.field)
                    return '';
                return vm.field.sort !== null ? 'active' : '';
            };
            /**
             * Get sort button icon class
             */
            vm.getSortButtonGlyphClass = function () {
                return vm.currentSortFunction === 'desc' ? 'glyphicon-sort-by-alphabet-alt' : 'glyphicon-sort-by-alphabet';
            };
            /**
             * Apply field sort. Parameter should be 'asc', 'desc' or null
             */
            vm.applyFieldSort = function (sortFunction) {
                if (!angular.isDefined(sortFunction)) {
                    if (vm.field.sort === null) {
                        // enable selected sort
                        $izendaInstantReportStorageService.applyFieldSort(vm.field, vm.currentSortFunction);
                    }
                    else {
                        // disable selected sort
                        $izendaInstantReportStorageService.applyFieldSort(vm.field, null);
                    }
                }
                else {
                    // set and enable selected sort
                    vm.currentSortFunction = sortFunction;
                    $izendaInstantReportStorageService.applyFieldSort(vm.field, vm.currentSortFunction);
                }
            };
            /**
             * Get italic button class
             */
            vm.getItalicButtonClass = function () {
                if (!vm.field)
                    return '';
                return vm.field.italic ? 'active' : '';
            };
            /**
             * Apply field italic.
             */
            vm.applyFieldItalic = function () {
                $izendaInstantReportStorageService.applyFieldItalic(vm.field, !vm.field.italic);
            };
            /**
             * Get visible button class
             */
            vm.getVisibleButtonClass = function () {
                if (!vm.field)
                    return '';
                var classes = [];
                if (vm.field.isVgUsed)
                    classes.push('disabled');
                if (!vm.field.visible)
                    classes.push('active');
                return classes.join(' ');
            };
            /**
             * Apply field italic.
             */
            vm.applyFieldVisible = function () {
                if (vm.field.isVgUsed)
                    return;
                $izendaInstantReportStorageService.applyFieldVisible(vm.field, !vm.field.visible);
                $izendaInstantReportValidationService.validateReportSetAndRefresh();
            };
            /**
             * Get bold button class
             */
            vm.getBoldButtonClass = function () {
                if (!vm.field)
                    return '';
                return vm.field.bold ? 'active' : '';
            };
            /**
             * Apply field bold.
             */
            vm.applyFieldBold = function () {
                $izendaInstantReportStorageService.applyFieldBold(vm.field, !vm.field.bold);
            };
            /**
             * Get visual group button class
             */
            vm.getVgButtonClass = function () {
                if (!vm.field)
                    return '';
                var classes = [];
                if (!vm.field.visible)
                    classes.push('disabled');
                if (vm.field.isVgUsed)
                    classes.push('active');
                return classes.join(' ');
            };
            /**
             * Apply visual group changed
             */
            vm.applyVg = function () {
                if (!vm.field.visible)
                    return;
                $izendaInstantReportStorageService.applyVisualGroup(vm.field, !vm.field.isVgUsed);
            };
            /**
             * If user selects non-default subtotal function, we need to turn on subtotals.
             */
            vm.onSubtotalFunctionSelect = function () {
                var subtotalFunction = vm.field.groupBySubtotalFunction;
                if (subtotalFunction !== 'DEFAULT')
                    $izendaInstantReportStorageService.getOptions().isSubtotalsEnabled = true;
            };
            /**
             * Check is subtotal group function === expression
             */
            vm.isSubtotalExpressionDisabled = function () {
                if (!angular.isObject(vm.field))
                    return true;
                if (!vm.isSubtotalsEnabled)
                    return true;
                if (!angular.isObject(vm.field.groupBySubtotalFunction))
                    return true;
                return vm.field.groupBySubtotalFunction.value !== 'EXPRESSION';
            };
            /**
            * Subreport selected handler
            */
            vm.subreportSelectedHandler = function () {
                vm.field.drillDownStyle = (vm.field.subreport) ? 'DetailLinkNewWindow' : '';
                $izendaInstantReportStorageService.disableEmbeddedDrillDownStyle(vm.field);
                $scope.$applyAsync();
            };
            /**
             * Close panel
             */
            vm.closePanel = function () {
                $izendaInstantReportStorageService.setCurrentActiveField(null);
            };
            /**
            * Initialize watchers
            */
            vm.initWatchers = function () {
                $scope.$watch('$izendaInstantReportStorageService.getCurrentActiveField()', function (field) {
                    vm.field = field;
                    vm.expanded = false;
                    if (angular.isObject(vm.field)) {
                        $izendaInstantReportStorageService.disableEmbeddedDrillDownStyle(vm.field);
                    }
                });
                $scope.$watch('$izendaInstantReportStorageService.getDrillDownStyles()', function (ddStyles) {
                    vm.drillDownStyles = ddStyles;
                });
                $scope.$watch('$izendaInstantReportStorageService.getExpressionTypes()', function (types) {
                    vm.expressionTypes = types;
                });
                $scope.$watch('$izendaInstantReportStorageService.getSubreports()', function (subreports) {
                    vm.subreports = subreports;
                });
                $scope.$watch('$izendaInstantReportStorageService.getOptions().isSubtotalsEnabled', function (isSubtotalsEnabled) {
                    vm.isSubtotalsEnabled = isSubtotalsEnabled;
                });
            };
            /**
            * Initialize controller
            */
            vm.init = function () {
            };
            // initialize with controller
            vm.initWatchers();
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-filters-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_31) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report filters controller
     */
    module_definition_31.default.controller('InstantReportFiltersController', [
        '$rootScope',
        '$scope',
        '$window',
        '$timeout',
        '$q',
        '$sce',
        '$log',
        '$izendaLocaleService',
        '$izendaSettingsService',
        '$izendaCompatibilityService',
        '$izendaUtilUiService',
        '$izendaInstantReportQueryService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportValidationService',
        function ($rootScope, $scope, $window, $timeout, $q, $sce, $log, $izendaLocaleService, $izendaSettingsService, $izendaCompatibilityService, $izendaUtilUiService, $izendaInstantReportQueryService, $izendaInstantReportStorageService, $izendaInstantReportValidationService) {
            'use strict';
            $scope.$izendaLocaleService = $izendaLocaleService;
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            $scope.$izendaSettingsService = $izendaSettingsService;
            $scope.$izendaCompatibilityService = $izendaCompatibilityService;
            var vm = this;
            vm.panelOpened = false;
            vm.filters = [];
            vm.filterOptions = $izendaInstantReportStorageService.getFilterOptions();
            vm.options = $izendaInstantReportStorageService.getOptions();
            vm.activeFields = [];
            vm.currentValue = '';
            vm.dateFormat = $izendaSettingsService.getDateFormat();
            vm.culture = $izendaSettingsService.getCulture();
            /**
             * Add new filter
             */
            vm.addFilter = function (fieldSysName) {
                $izendaInstantReportStorageService.createNewFilter(fieldSysName).then(function (filter) {
                    if (filter.field !== null && !filter.field.allowedInFilters) {
                        var errorTitle = $izendaLocaleService.localeText('js_Error', 'Error');
                        var errorText = $izendaLocaleService.localeText('js_FieldForbiddenForFiltering', 'This field is forbidden to use for filtering.');
                        $izendaUtilUiService.showNotification(errorText, errorTitle);
                        return;
                    }
                    $izendaInstantReportStorageService.getFilters().push(filter);
                    filter.initialized = true;
                    $izendaInstantReportValidationService.validateReportSet();
                    $izendaInstantReportStorageService.setFilterOperator(filter, null).then(function () {
                        $scope.$applyAsync();
                    });
                });
            };
            /**
             * Swap filter handler
             */
            vm.reorderFilters = function (index1, index2) {
                $izendaInstantReportStorageService.swapFilters(index1, index2);
                var allfilters = $izendaInstantReportStorageService.getFilters();
                var index = Math.min(index1, index2);
                var filter = allfilters[index];
                $izendaInstantReportStorageService.updateFieldFilterExistentValues(filter).then(function () {
                    $izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
                        $scope.$applyAsync();
                    });
                });
            };
            /**
             * Move to filter handler
             */
            vm.moveFilterTo = function (index1, index2) {
                $izendaInstantReportStorageService.moveFilterTo(index1, index2);
                var allfilters = $izendaInstantReportStorageService.getFilters();
                var index = Math.min(index1, index2);
                index = index > 0 ? index - 1 : 0;
                var filter = allfilters[index];
                $izendaInstantReportStorageService.updateFieldFilterExistentValues(filter).then(function () {
                    $izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
                        $scope.$applyAsync();
                    });
                });
            };
            /**
             * Remove filter
             */
            vm.removeFilter = function (filter) {
                var allfilters = $izendaInstantReportStorageService.getFilters();
                var count = allfilters.length;
                var index = $izendaInstantReportStorageService.getFilters().indexOf(filter);
                $izendaInstantReportStorageService.removeFilter(filter);
                $izendaInstantReportValidationService.validateReportSet();
                if (count === 0)
                    return;
                // refresh next filters after apply cascading
                var nextFilter;
                if (index === 0) {
                    nextFilter = allfilters[0];
                }
                else {
                    nextFilter = allfilters[index - 1];
                }
                $izendaInstantReportStorageService.updateFieldFilterExistentValues(nextFilter).then(function () {
                    $izendaInstantReportStorageService.refreshNextFiltersCascading(nextFilter).then(function () {
                        $scope.$applyAsync();
                    });
                });
            };
            /**
             * Handler when field selected
             */
            vm.onFilterFieldChange = function (filter) {
                if (!filter.initialized)
                    return;
                filter.values = [];
                filter.currentValue = '';
                $izendaInstantReportValidationService.validateReportSet();
                $izendaInstantReportStorageService.loadFilterFormats(filter);
                $izendaInstantReportStorageService.setFilterOperator(filter).then(function () {
                    $izendaInstantReportStorageService.getPopupFilterCustomTemplate(filter);
                    $izendaInstantReportStorageService.updateFieldFilterExistentValues(filter, true).then(function () {
                        $izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
                            $scope.$applyAsync();
                        });
                    });
                });
            };
            /**
             * Prepare filter values and existing values
             */
            vm.onFilterOperatorChange = function (filter) {
                filter.values = [];
                var asyncPromise = $q(function (resolve) {
                    var operatorType = $izendaInstantReportStorageService.getFieldFilterOperatorValueType(filter.operator);
                    if (operatorType === 'oneValue' || operatorType === 'oneDate') {
                        filter.values = [''];
                        resolve();
                        return;
                    }
                    if (operatorType === 'twoValues' || operatorType === 'twoDates') {
                        filter.values = ['', ''];
                        resolve();
                        return;
                    }
                    if (operatorType === 'Equals_TextArea') {
                        filter.currentValue = '';
                        resolve();
                        return;
                    }
                    if (operatorType === 'Equals_Autocomplete' || operatorType === 'select_multiple') {
                        filter.values = [''];
                        resolve();
                        return;
                    }
                    if (operatorType === 'select_popup') {
                        $izendaInstantReportStorageService.getPopupFilterCustomTemplate(filter).then(function () {
                            resolve();
                        });
                        return;
                    }
                    resolve();
                });
                asyncPromise.then(function () {
                    $izendaInstantReportStorageService.updateFieldFilterExistentValues(filter, true).then(function () {
                        $izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
                            $scope.$applyAsync();
                        });
                    });
                });
            };
            /**
             * Return array of titles
             */
            vm.getExistentValuesSimpleList = function (existentValues) {
                var result = angular.element.map(existentValues, function (val) {
                    return val.text;
                });
                return result;
            };
            /**
             * Update autocomplete items while user entering some text
             * @param {object} filter
             * @param {string} autocompleteText
             * @return {angular promise}. Promise on complete
             */
            vm.updateAutoCompleteItems = function (filter, autocompleteText) {
                return $q(function (resolve) {
                    filter.possibleValue = autocompleteText;
                    $izendaInstantReportStorageService.updateFieldFilterExistentValues(filter, true).then(function () {
                        filter.possibleValue = null;
                        resolve(filter.existentValues);
                    });
                });
            };
            /**
             * Prepare value for filter
             */
            vm.onCurrentValueChange = function (filter) {
                if (!filter.isFilterReady)
                    return;
                // prepare data:
                if (filter.operator.value === 'Equals_TextArea') {
                    var values = filter.currentValue.match(/^.*((\r\n|\n|\r)|$)/gm);
                    filter.values = [];
                    angular.element.each(values, function () {
                        if (this.trim() !== '' && filter.values.indexOf(this.trim()) < 0)
                            filter.values.push(this.trim());
                    });
                }
                // refresh cascading:
                $izendaInstantReportStorageService.updateFieldFilterExistentValues(filter).then(function () {
                    $izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
                        $scope.$applyAsync();
                    });
                });
            };
            /**
             * On filter logic change.
             */
            vm.onFilterLogicChange = function () {
                if (vm.filters.length === 0)
                    return;
                if (vm.filterOptions.filterLogic) {
                    $izendaInstantReportStorageService.refreshFiltersForFilterLogic().then(function () {
                        $scope.$applyAsync();
                    });
                }
                else {
                    vm.onCurrentValueChange(vm.filters[0]);
                }
            };
            /**
             * Change value handler for custom popup filter.
             */
            vm.onPopupValueChange = function (filter, newValue) {
                filter.values = newValue.split(',');
                $izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
                    $scope.$applyAsync();
                });
            };
            /**
             * Get btn text for popup
             */
            vm.getPopupBtnText = function (filter) {
                if (!angular.isArray(filter.values) || filter.values.length === 0)
                    return '...';
                var labels = [];
                angular.element.each(filter.values, function () {
                    var filterValue = this;
                    angular.element.each(filter.existentValues, function () {
                        var existentValue = this;
                        if (existentValue.value === filterValue)
                            labels.push(existentValue.text);
                    });
                });
                var result = labels.join(', ');
                if (result.length > 30) {
                    result = result.substring(0, 30);
                    result += '...';
                }
                return result;
            };
            /**
             * Toggle filter value
             */
            vm.toggleValue = function (filter, value) {
                var values = filter.values;
                var index = values.indexOf(value);
                if (index >= 0)
                    values.splice(index, 1);
                else
                    values.push(value);
                $izendaInstantReportStorageService.refreshNextFiltersCascading(filter).then(function () {
                    $scope.$applyAsync();
                });
            };
            /**
             * Is value in values collection in filter
             */
            vm.isValueChecked = function (filter, value) {
                var values = filter.values;
                return values.indexOf(value) >= 0;
            };
            /**
             * Get filter value type
             */
            vm.getFilterOperatorType = function (filter) {
                return $izendaInstantReportStorageService.getFieldFilterOperatorValueType(filter.operator);
            };
            /**
             * Apply filters
             */
            vm.applyFilters = function () {
                $izendaInstantReportValidationService.validateReportSetAndRefresh();
            };
            /**
             * Close filters panel
             */
            vm.closeFiltersPanel = function () {
                $izendaInstantReportStorageService.setFiltersPanelOpened(false);
            };
            /**
             * Initialize watches
             */
            vm.initWatchers = function () {
                $scope.$watch('$izendaSettingsService.getDateFormat()', function (dateFormat) {
                    vm.dateFormat = dateFormat;
                }, true);
                $scope.$watch('$izendaSettingsService.getCulture()', function (culture) {
                    vm.culture = culture;
                });
                $scope.$watchCollection('$izendaInstantReportStorageService.getFilters()', function (newFilters, oldFilters) {
                    vm.filters = newFilters;
                });
                $scope.$watch('$izendaInstantReportStorageService.getFilterOptions()', function (newValue) {
                    vm.filterOptions = newValue;
                });
                $scope.$watch('$izendaInstantReportStorageService.getOptions()', function (options) {
                    vm.options = options;
                });
                $scope.$watchCollection('$izendaInstantReportStorageService.getAllFieldsInActiveTables(true)', function (newActiveFields) {
                    // sync collection elements:
                    // add:
                    angular.element.each(newActiveFields, function () {
                        var newActiveField = this;
                        if (!newActiveField.allowedInFilters)
                            return;
                        var found = false;
                        angular.element.each(vm.activeFields, function () {
                            if (this === newActiveField)
                                found = true;
                        });
                        if (!found)
                            vm.activeFields.push(newActiveField);
                    });
                    // remove:
                    var i = 0;
                    while (i < vm.activeFields.length) {
                        var field = vm.activeFields[i];
                        var found = false;
                        for (var j = 0; j < newActiveFields.length; j++) {
                            if (newActiveFields[j] === field)
                                found = true;
                        }
                        if (!found)
                            vm.activeFields.splice(i, 1);
                        else
                            i++;
                    }
                });
                $scope.$watch('$izendaInstantReportStorageService.getFiltersPanelOpened()', function (opened) {
                    vm.panelOpened = opened;
                });
            };
            /**
             * Initialize controller
             */
            vm.init = function () {
                vm.filters = $izendaInstantReportStorageService.getFilters();
            };
            vm.initWatchers();
        }
    ]);
    /**
     * Find all opened filter popup modals and close it.
     */
    window.hideModal = function () {
        var popupModals = document.getElementsByName('filtersPopupModalDialog');
        angular.element.each(popupModals, function () {
            var $modal = angular.element(this);
            if ($modal.hasClass('modal') && $modal.hasClass('in')) {
                $modal['modal']('hide');
            }
        });
    };
    /**
     * Custom popup filter modal submit callback.
     */
    window.CC_CustomFilterPageValueReceived = function () { };
    /**
     * Override hide modal function.
     */
    window.hm = function () {
        window.hideModal();
    };
    /**
     * Directive, which used for listening custom popup filters value change.
     */
    module_definition_31.default.directive('izendaOnPopupValueChange', [
        '$interval',
        function ($interval) {
            return {
                restrict: 'A',
                scope: {
                    handler: '&izendaOnPopupValueChange'
                },
                link: function ($scope, $element, attrs) {
                    var previousValue = $element.val();
                    var intervalId = $interval(function () {
                        var newValue = $element.val();
                        if (newValue !== previousValue) {
                            $scope.handler({
                                newValue: newValue
                            });
                            previousValue = newValue;
                        }
                    }, 20);
                    // we should turn off interval on destroy input tag.
                    $scope.$on('$destroy', function handleDestroyEvent() {
                        if (intervalId) {
                            $interval.cancel(intervalId);
                            intervalId = null;
                        }
                    });
                }
            };
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-format-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_32) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report formatting controller definition
     */
    module_definition_32.default.controller('InstantReportFormatController', [
        '$rootScope',
        '$scope',
        '$window',
        '$timeout',
        '$q',
        '$log',
        '$izendaLocaleService',
        '$izendaCompatibilityService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportSettingsService',
        function ($rootScope, $scope, $window, $timeout, $q, $log, $izendaLocaleService, $izendaCompatibilityService, $izendaInstantReportStorageService, $izendaInstantReportSettingsService) {
            'use strict';
            $scope.$izendaCompatibilityService = $izendaCompatibilityService;
            var vm = this;
            vm.optGroups = {
                'headerAndFooter': {
                    opened: false
                },
                'color': {
                    opened: false
                },
                'page': {
                    opened: false
                },
                'drilldowns': {
                    opened: false
                }
            };
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            vm.options = $izendaInstantReportStorageService.getOptions();
            vm.vgStyles = [];
            vm.allActiveFields = [];
            vm.drillDownFields = $izendaInstantReportStorageService.getDrillDownFields();
            vm.selectedDrilldownField = null;
            vm.settings = $izendaInstantReportSettingsService.getSettings();
            vm.ddkValuesMaxAmount = vm.settings.ddkValuesMaxAmount;
            vm.allowVirtualDataSources = vm.settings.allowVirtualDataSources;
            /**
             * Restore default color settings.
             */
            vm.restoreDefaultColors = function () {
                $izendaInstantReportStorageService.restoreDefaultColors();
            };
            /**
             * Remove fields which are already in drilldown collection
             */
            vm.removeDrilldownFieldsFromAvailable = function () {
                vm.allActiveFields = angular.element.grep(vm.allActiveFields, function (f) {
                    var found = false;
                    angular.element.each(vm.drillDownFields, function () {
                        var ddField = this;
                        if (ddField.id === f.id)
                            found = true;
                    });
                    return !found;
                });
            };
            /**
             * update available collection
             */
            vm.syncAvailableCollection = function () {
                var activeTables = $izendaInstantReportStorageService.getActiveTables();
                vm.allActiveFields = [];
                angular.element.each(activeTables, function () {
                    var table = this;
                    angular.element.each(table.fields, function () {
                        vm.allActiveFields.push(this);
                    });
                });
                vm.removeDrilldownFieldsFromAvailable();
            };
            /**
             * Add drilldown key
             */
            vm.addDrilldown = function () {
                if (vm.selectedDrilldownField === null)
                    return;
                if (vm.drillDownFields.length >= vm.ddkValuesMaxAmount)
                    return;
                vm.drillDownFields.push(vm.selectedDrilldownField);
                vm.syncAvailableCollection();
            };
            /**
             * Remove drilldown field
             */
            vm.removeDrilldownField = function (field) {
                var index = vm.drillDownFields.indexOf(field);
                vm.drillDownFields.splice(index, 1);
                vm.syncAvailableCollection();
            };
            /**
            * Initialize controller
            */
            vm.init = function () {
                /**
                 * Look for options change
                 */
                $scope.$watch('$izendaInstantReportStorageService.getOptions()', function (options) {
                    vm.options = options;
                });
                $scope.$watch('$izendaInstantReportStorageService.getVgStyles()', function (styles) {
                    vm.vgStyles = styles;
                });
                $scope.$watch('$izendaInstantReportStorageService.getDrillDownFields()', function (ddFields) {
                    vm.drillDownFields = ddFields;
                    vm.syncAvailableCollection();
                });
                $scope.$watchCollection('$izendaInstantReportStorageService.getActiveTables()', function () {
                    vm.syncAvailableCollection();
                });
            };
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-pivot-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_33) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    module_definition_33.default.controller('InstantReportPivotsController', [
        '$rootScope',
        '$scope',
        '$izendaLocaleService',
        '$izendaCompatibilityService',
        '$izendaInstantReportStorageService',
        '$izendaInstantReportPivotService',
        '$izendaInstantReportValidationService',
        function ($rootScope, $scope, $izendaLocaleService, $izendaCompatibilityService, $izendaInstantReportStorageService, $izendaInstantReportPivotService, $izendaInstantReportValidationService) {
            var vm = this;
            $scope.$izendaInstantReportPivotService = $izendaInstantReportPivotService;
            $scope.$izendaInstantReportStorageService = $izendaInstantReportStorageService;
            vm.panelOpened = false; // pivot panel state
            vm.activeFields = $izendaInstantReportStorageService.getAllFieldsInActiveTables(true);
            vm.pivotColumn = $izendaInstantReportPivotService.getPivotColumn();
            vm.pivotOptions = $izendaInstantReportPivotService.getPivotOptions();
            vm.cellValues = $izendaInstantReportPivotService.getCellValues();
            vm.selectedFields = [];
            var updateSelectedFieldsArray = function () {
                vm.selectedFields = [];
                vm.cellValues.forEach(function (cellValue) {
                    if (cellValue)
                        vm.selectedFields.push($izendaInstantReportStorageService.getFieldBySysName(cellValue.sysname));
                });
            };
            updateSelectedFieldsArray();
            ////////////////////////////
            // pivot column
            ////////////////////////////
            /**
             * Get additional class for "add cell value" button.
             * @returns {string} class names 'class1 class2 ...'.
             */
            vm.getAddCellBtnClass = function () {
                if (!vm.pivotColumn)
                    return 'disabled';
                var result = false;
                angular.element.each(vm.cellValues, function (iValue, value) {
                    if (!value)
                        result = true;
                });
                return result ? 'disabled' : '';
            };
            /**
             * Update validation
             */
            vm.updateValidation = function () {
                $izendaInstantReportValidationService.validateReportSet();
            };
            /**
             * Update validation state and refresh if needed.
             */
            vm.updateReportSetValidationAndRefresh = function () {
                $izendaInstantReportPivotService.setDefaultGroup();
                $izendaInstantReportStorageService.clearReportPreviewHtml();
                $izendaInstantReportStorageService.applyAutoGroups(true);
                $izendaInstantReportValidationService.validateReportSetAndRefresh();
            };
            /**
             * User selected pivot column
             */
            vm.onPivotColumnFieldSelect = function () {
                if (vm.pivotColumn !== null) {
                    var sourceField = $izendaInstantReportStorageService.getFieldBySysName(vm.pivotColumn.sysname);
                    var groupName = null;
                    var oldPivotColumn = $izendaInstantReportPivotService.getPivotColumn();
                    if (angular.isObject(oldPivotColumn) && sourceField.sysname === oldPivotColumn.sysname) {
                        groupName = oldPivotColumn.groupByFunction.value;
                    }
                    $izendaInstantReportStorageService.copyFieldObject(sourceField, vm.pivotColumn, true);
                    $izendaInstantReportStorageService.resetFieldObject(vm.pivotColumn);
                    vm.pivotColumn.isPivotColumn = true;
                    $izendaInstantReportPivotService.setPivotColumn(vm.pivotColumn);
                    $izendaInstantReportStorageService.initializeField(vm.pivotColumn).then(function () {
                        if (groupName !== null) {
                            angular.element.each(vm.pivotColumn.groupByFunctionOptions, function () {
                                if (this.value === groupName)
                                    vm.pivotColumn.groupByFunction = this;
                            });
                        }
                        if (vm.cellValues.length === 0) {
                            vm.addCellValue();
                        }
                        vm.updateReportSetValidationAndRefresh();
                        $scope.$applyAsync();
                    });
                }
            };
            ////////////////////////////
            // cell values
            ////////////////////////////
            /**
             * Cell value field select handler
             */
            vm.onCellValueFieldSelect = function (index) {
                var selectedField = vm.selectedFields[index];
                var cellValue = vm.cellValues[index];
                if (angular.isObject(cellValue) && selectedField.sysname === cellValue.sysname)
                    return;
                if (cellValue === null) {
                    // if field wasn't set yet
                    vm.cellValues[index] = cellValue = $izendaInstantReportStorageService.createFieldObject(selectedField.name, selectedField.parentId, selectedField.tableSysname, selectedField.tableName, selectedField.sysname, selectedField.typeGroup, selectedField.type, selectedField.sqlType);
                }
                $izendaInstantReportStorageService.copyFieldObject(selectedField, cellValue, true);
                $izendaInstantReportStorageService.resetFieldObject(cellValue);
                $izendaInstantReportStorageService.initializeField(cellValue).then(function (f) {
                    angular.element.each(f.groupByFunctionOptions, function () {
                        if (this.value.toLowerCase() === 'group')
                            f.groupByFunction = this;
                    });
                    vm.updateReportSetValidationAndRefresh();
                    $scope.$applyAsync();
                });
            };
            /**
             * Cell value function select handler
             */
            vm.onCellValueFunctionSelect = function (cellValue) {
                if (cellValue.groupByFunction === null)
                    return;
                $izendaInstantReportStorageService.onFieldFunctionApplied(cellValue);
                vm.updateReportSetValidationAndRefresh();
            };
            /**
             * Cell value
             */
            vm.showAdvancedOptions = function (cellValue) {
                cellValue.isPivotCellValue = true;
                $izendaInstantReportStorageService.applyFieldSelected(cellValue, true);
            };
            /**
             * Create cell value item
             */
            vm.addCellValue = function () {
                $izendaInstantReportPivotService.addCellValue();
                vm.selectedFields.push(null);
                vm.updateValidation();
            };
            vm.clearPivots = function () {
                $izendaInstantReportPivotService.removePivots();
                vm.updateReportSetValidationAndRefresh();
            };
            /**
             * Remove cell value
             */
            vm.removeCellValue = function (cellValue) {
                var idx = vm.cellValues.indexOf(cellValue);
                vm.selectedFields.splice(idx, 1);
                $izendaInstantReportPivotService.removeCellValue(cellValue);
                vm.updateReportSetValidationAndRefresh();
            };
            /**
             * Move cell value
             */
            vm.moveCellValueTo = function (fromIndex, toIndex) {
                $izendaInstantReportPivotService.moveCellValueTo(fromIndex, toIndex);
                vm.selectedFields.splice(toIndex, 0, vm.selectedFields.splice(fromIndex, 1)[0]);
                $scope.$applyAsync();
            };
            /**
             * Reorder cells
             */
            vm.reorderCellValue = function (fromIndex, toIndex) {
                $izendaInstantReportPivotService.swapCellValues(fromIndex, toIndex);
                var temp = vm.selectedFields[fromIndex];
                vm.selectedFields[fromIndex] = vm.selectedFields[toIndex];
                vm.selectedFields[toIndex] = temp;
                $scope.$applyAsync();
            };
            /**
             * Add pivot item
             */
            vm.addPivotItem = function (fieldSysName) {
                if (!angular.isString(fieldSysName))
                    return;
                if ($izendaInstantReportStorageService.getActiveTables().length === 0)
                    return;
                // open panel
                $izendaInstantReportStorageService.setFiltersPanelOpened(false);
                $izendaInstantReportPivotService.setPivotsPanelOpened(true);
                // create and add pivot item
                var field = $izendaInstantReportStorageService.getFieldBySysName(fieldSysName);
                var newItem = $izendaInstantReportStorageService.createFieldObject(field.name, field.parentId, field.tableSysname, field.tableName, field.sysname, field.typeGroup, field.type, field.sqlType);
                $izendaInstantReportStorageService.initializeField(newItem).then(function (f) {
                    $scope.$applyAsync();
                });
                $izendaInstantReportPivotService.addPivotItem(newItem);
                $izendaInstantReportStorageService.applyAutoGroups(true);
            };
            /**
            * Initialize controller
            */
            vm.init = function () {
                // pivot panel state listener
                $scope.$watch('$izendaInstantReportPivotService.getPivotsPanelOpened()', function (opened) {
                    vm.panelOpened = opened;
                });
                // main pivot column
                $scope.$watch('$izendaInstantReportPivotService.getPivotColumn()', function (pivotColumn) {
                    vm.pivotColumn = pivotColumn;
                });
                // pivot cell values
                $scope.$watchCollection('$izendaInstantReportPivotService.getCellValues()', function (cellValues) {
                    vm.cellValues = cellValues;
                    updateSelectedFieldsArray();
                });
                $scope.$watch('$izendaInstantReportPivotService.getPivotOptions()', function (pivotOptions) {
                    vm.pivotOptions = pivotOptions;
                });
                // listen for active field items
                $scope.$watchCollection('$izendaInstantReportStorageService.getAllFieldsInActiveTables(true)', function (newActiveFields) {
                    // add:
                    var countOfChanges = 0;
                    angular.element.each(newActiveFields, function () {
                        var newActiveField = this;
                        var found = false;
                        angular.element.each(vm.activeFields, function () {
                            if (this.sysname === newActiveField.sysname)
                                found = true;
                        });
                        if (!found) {
                            vm.activeFields.push(newActiveField);
                            countOfChanges++;
                        }
                    });
                    // remove:
                    var i = 0;
                    while (i < vm.activeFields.length) {
                        var field = vm.activeFields[i];
                        var found = false;
                        for (var j = 0; j < newActiveFields.length; j++) {
                            if (newActiveFields[j].sysname === field.sysname)
                                found = true;
                        }
                        if (!found) {
                            vm.activeFields.splice(i, 1);
                            countOfChanges++;
                        }
                        else
                            i++;
                    }
                    $izendaInstantReportPivotService.syncPivotState(vm.activeFields);
                });
            };
        }
    ]);
});
izendaRequire.define("instant-report/controllers/instant-report-validation-controller", ["require", "exports", "angular", "instant-report/module-definition", "izenda-external-libs"], function (require, exports, angular, module_definition_34) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Instant report validation controller.
     */
    module_definition_34.default.controller('InstantReportValidationController', [
        '$rootScope',
        '$scope',
        '$izendaLocaleService',
        '$izendaInstantReportValidationService',
        function ($rootScope, $scope, $izendaLocaleService, $izendaInstantReportValidationService) {
            'use strict';
            var vm = this;
            $scope.$izendaInstantReportValidationService = $izendaInstantReportValidationService;
            vm.isValid = true;
            vm.messages = [];
            vm.infoMessages = [];
            /**
            * Initialize controller
            */
            vm.init = function () {
                $scope.$watch('$izendaInstantReportValidationService.getValidationMessages()', function (messages) {
                    vm.isValid = $izendaInstantReportValidationService.isReportValid();
                    vm.messages = [];
                    vm.infoMessages = [];
                    angular.element.each(messages, function () {
                        var message = this;
                        if (message.type === 'info') {
                            vm.infoMessages.push(message);
                        }
                        else {
                            vm.messages.push(message);
                        }
                    });
                });
            };
        }
    ]);
});
izendaRequire.define("instant-report/module", ["require", "exports", "instant-report/module-definition", "instant-report/services/instant-report-query", "instant-report/services/instant-report-pivot", "instant-report/services/instant-report-settings", "instant-report/services/instant-report-visualization", "instant-report/services/instant-report-storage", "instant-report/services/instant-report-validation", "izenda-external-libs", "instant-report/directive/instant-report-field-draggable", "instant-report/directive/instant-report-left-panel-resize", "instant-report/controllers/instant-report-charts-controller", "instant-report/controllers/instant-report-columns-sort-controller", "instant-report/controllers/instant-report-controller", "instant-report/controllers/instant-report-data-source-controller", "instant-report/controllers/instant-report-field-options-controller", "instant-report/controllers/instant-report-filters-controller", "instant-report/controllers/instant-report-format-controller", "instant-report/controllers/instant-report-pivot-controller", "instant-report/controllers/instant-report-validation-controller"], function (require, exports, module_definition_35, instant_report_query_1, instant_report_pivot_1, instant_report_settings_1, instant_report_visualization_1, instant_report_storage_1, instant_report_validation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    instant_report_query_1.default.register(module_definition_35.default);
    instant_report_pivot_1.default.register(module_definition_35.default);
    instant_report_settings_1.default.register(module_definition_35.default);
    instant_report_visualization_1.default.register(module_definition_35.default);
    instant_report_storage_1.default.register(module_definition_35.default);
    instant_report_validation_1.default.register(module_definition_35.default);
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
