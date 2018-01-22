var __extends=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])};return function(t,r){function s(){this.constructor=t}e(t,r),t.prototype=null===r?Object.create(r):(s.prototype=r.prototype,new s)}}(),LPUtils;!function(e){function t(e,t){if(e&&t){Array.isArray(t)||(t=[t]);for(var r=0;r<t.length;++r)if(e.indexOf(t[r])>-1)return!0}return!1}e.stringContains=t}(LPUtils||(LPUtils={}));var LPFormParser;!function(e){var t=function(){function e(){this.operations=[]}return e.regexMatches=function(e,t){var r=!1;if(e){var s=function(e,t){return"string"==typeof t&&e.test(t.toLowerCase())};Array.isArray(t)?t.forEach(function(t){return r=r||s(e,t)}):r=s(e,t)}return r},e.getFormFieldRegex=function(e){var t=get_ff_translation(e);if(t)return new RegExp(t)},e.prototype.parse=function(e,t,r){for(var s=null,i=0,a=this.operations;i<a.length;i++){if((s=(0,a[i])(e,t,r))||!1===s)break}return s},e}();e.FieldParser=t}(LPFormParser||(LPFormParser={}));var LPFormParser;!function(e){var t=function(t){function r(){var s=t.call(this)||this;return r.excludedFields.length||(r.excludedFields=[{type:"attr",regex:e.FieldParser.getFormFieldRegex("ff_ssn_regexp")},{type:"attr",regex:e.FieldParser.getFormFieldRegex("ff_cccsc_regexp")},{type:"attr",regex:e.FieldParser.getFormFieldRegex("ff_securityanswer_regexp")},{type:"attr",regex:e.FieldParser.getFormFieldRegex("ff_captcha_regexp")},{type:"text",regex:e.FieldParser.getFormFieldRegex("ff_text_ssn_regexp")},{type:"text",regex:e.FieldParser.getFormFieldRegex("ff_text_cccsc_regexp")}]),s.operations=[r.excludedFieldOperation,r.singlePasswordFieldOperation,r.multiplePasswordOperation,r.multiplePasswordsOneExistingOperation,r.passwordLikeAttribute],s}return __extends(r,t),r.excludedFieldOperation=function(t,s,i){for(var a=0;a<t.fields.length;++a)for(var n=t.fields[a],o=0;o<r.excludedFields.length;++o){var u=r.excludedFields[o];if(u.regex){if("attr"===u.type&&e.FieldParser.regexMatches(u.regex,[n.id,n.attributes.name]))return!1;if("text"===u.type&&e.FieldParser.regexMatches(u.regex,n.label))return!1}}return null},r.singlePasswordFieldOperation=function(e,t,r){if(1===t.uniquePasswords.length){var s=t.uniquePasswords[0];return 2===t.passwordsByValue[s].count&&(2===e.fields.length?e.passwordChangeForm=!0:e.createAccountForm=!0),s}return null},r.multiplePasswordOperation=function(e,t,r){for(var s=0,i=t.uniquePasswords;s<i.length;s++){var a=i[s];if(t.passwordsByValue[a].count>1)return 2===t.uniquePasswords.length?(e.passwordChangeForm=!0,e.originalPassword=t.uniquePasswords[0]===a?t.uniquePasswords[1]:t.uniquePasswords[0]):e.createAccountForm=!0,a}return null},r.multiplePasswordsOneExistingOperation=function(e,t,s){if(2===t.uniquePasswords.length){var i=r.findMatchingPassword(s.getSites(),t.uniquePasswords);if(i)return e.passwordChangeForm=!0,e.originalPassword=i,t.uniquePasswords[0]===i?t.uniquePasswords[1]:t.uniquePasswords[0]}return null},r.passwordLikeAttribute=function(e,t,r){for(var s=0,i=t.uniquePasswords;s<i.length;s++){var a=i[s],n=t.passwordsByValue[a].field,o=["pw","pass"];if(LPUtils.stringContains(n.attributes.name,o)||LPUtils.stringContains(n.id,o))return a}},r.findMatchingPassword=function(e,t){for(var r=0;r<e.length;++r){var s=LPUtils.SiteParser.findMatchingSitePassword(e[r],t);if(s)return s}return null},r.excludedFields=[],r}(e.FieldParser);e.PasswordFieldParser=t}(LPFormParser||(LPFormParser={}));var LPFormParser;!function(e){var t=function(t){function r(e){var s=t.call(this)||this;return s.isStrict=e,s.isStrict?s.operations=[r.userNameLikeLabelOperation,r.userNameLikeAttributeOperation]:s.operations=[r.userNameLikeLabelOperation,r.singleTextFieldOperation,r.multipleTextFieldOperation,r.nearPasswordFieldOpeartion,r.existingUserNameOperation,r.uniqueEmailFieldOperation,r.userNameLikeAttributeOperation],s}return __extends(r,t),r.userNameLikeLabelOperation=function(t,s,i){if(r.userNameRegEx)for(var a=0,n=t.fields;a<n.length;a++){var o=n[a];if(e.FieldParser.regexMatches(r.userNameRegEx,o.label))return o.value}return null},r.userNameLikeAttributeOperation=function(e,t,r){for(var s=0,i=t.uniqueTextValues;s<i.length;s++){var a=i[s],n=t.textFieldsByValue[a].field;if(LPUtils.stringContains(n.attributes.name,"user")||LPUtils.stringContains(n.id,"user"))return a}return null},r.singleTextFieldOperation=function(e,t,r){if(1===t.uniqueTextValues.length){var s=t.uniqueTextValues[0];return 2===t.textFieldsByValue[s].count&&(e.createAccountForm=!0),s}return null},r.multipleTextFieldOperation=function(e,t,r){for(var s=0,i=t.uniqueTextValues;s<i.length;s++){var a=i[s];if(t.textFieldsByValue[a].count>1)return e.createAccountForm=!0,a}return null},r.nearPasswordFieldOpeartion=function(e,t,r){for(var s=e.fields,i=1;i<s.length;++i){if("password"===s[i].type){var a=s[i-1];if("password"!==a.type)return a.value}}return null},r.existingUserNameOperation=function(e,t,r){for(var s in g_sites)if(t.uniqueTextValues.indexOf(g_sites[s].unencryptedUsername)>-1)return g_sites[s].unencryptedUsername;return null},r.uniqueEmailFieldOperation=function(e,t,s){for(var i=[],a=0,n=t.uniqueTextValues;a<n.length;a++){var o=n[a],u=o.match(r.emailRegex);u&&1===u.length&&i.push(o)}return 1===i.length?i[0]:null},r.emailRegex=/[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*/g,r.userNameRegEx=e.FieldParser.getFormFieldRegex("ff_username_regexp"),r}(e.FieldParser);e.UserNameFieldParser=t}(LPFormParser||(LPFormParser={}));var LPFormParser;!function(e){var t=function(){function e(e){var t=this;this.passwordsByValue={},this.textFieldsByValue={},this.textFieldsByType={},this.uniqueTextValues=[],this.uniquePasswords=[],e.fields&&(e.fields.forEach(function(e){"password"===e.type?t.aggregateField(e,e.value,t.passwordsByValue):(t.aggregateField(e,e.value,t.textFieldsByValue),t.aggregateField(e,e.type,t.textFieldsByType))}),this.uniqueTextValues=Object.keys(this.textFieldsByValue),this.uniquePasswords=Object.keys(this.passwordsByValue))}return e.prototype.aggregateField=function(e,t,r){var s=r[t];s?++s.count:r[t]={field:e,count:1}},e}();e.FormMetaData=t}(LPFormParser||(LPFormParser={}));var LPFormParser;!function(e){var t=function(){function t(t,r,s){this._formData=null,this._userNameField=null,this._succeeded=!1,this._submitted=!1,r.fields=r.fields||[];var i=new e.FormMetaData(r);if(!r.password)if(r.generatedPassword)r.password=r.generatedPassword;else{var a=(new e.PasswordFieldParser).parse(r,i,t);"string"==typeof a&&(r.password=a)}var n=new e.UserNameFieldParser(s&&s.strict),o=n.parse(r,i,t),u=[];if("string"==typeof o){u=t.getSites().filter(function(e){return LPUtils.SiteParser.hasMatchingSiteUserName(e,o)});r.username&&0===u.length&&!r.createAccountForm||(r.username=o)}if(r.username&&!r.createAccountForm)for(var l=0,d=r.fields;l<d.length;l++){var f=d[l];if(f.value===r.username){this._userNameField=f;break}}this._formData=r}return t.prototype.submitted=function(e){return"boolean"==typeof e&&(this._submitted=e),this._submitted},t.prototype.succeeded=function(e){return"boolean"==typeof e&&(this._succeeded=e),this._succeeded},t.prototype.getUsernameField=function(){return this._userNameField},t.prototype.getUsername=function(){return this._formData.username},t.prototype.getPassword=function(){return this._formData.password},t.prototype.getOriginalPassword=function(){return this._formData.originalPassword},t.prototype.getFormData=function(){return this._formData},t.prototype.getFields=function(){return this._formData.fields},t.prototype.isChangePasswordForm=function(){return!!this._formData.passwordChangeForm},t.prototype.isCreateAccountForm=function(){return!!this._formData.passwordChangeForm},t.prototype.isBasicAuthentication=function(){return!!this._formData.basicAuthentication},t.prototype.shouldSaveFields=function(){return!this.isChangePasswordForm()&&!this.isCreateAccountForm()},t.prototype.getURL=function(){return this._formData.url},t}();e.FormParser=t}(LPFormParser||(LPFormParser={}));var LPUtils;!function(e){function t(e,t){return lpmdec_acct(t,!0,e,g_shares)}e.decrypt=t}(LPUtils||(LPUtils={}));var LPUtils;!function(e){var t=function(){function t(){}return t.findMatchingSitePassword=function(t,r){Array.isArray(r)||(r=[r]);var s=r.indexOf(e.decrypt(t,t.password));if(-1===s&&t.fields&&t.fields.length>0)for(var i=0;i<t.fields.length;++i){var a=t.fields[i];if("password"===a.type&&(s=r.indexOf(e.decrypt(t,a.value)))>-1)break}return s>-1?r[s]:null},t.hasMatchingSiteUserName=function(t,r){if(!r)return!1;if(this.userNamesMatch(t.unencryptedUsername,r))return!0;if(t.fields&&t.fields.length)for(var s=0,i=t.fields;s<i.length;s++){var a=i[s];switch(a.type){case"text":case"email":case"tel":if(this.userNamesMatch(e.decrypt(t,a.value),r))return!0}}return!1},t.userNamesMatch=function(e,t){return e===t||this.userNameInEmail(e,t)||this.userNameInEmail(t,e)||this.isMaskedUsername(e,t)},t.userNameInEmail=function(e,t){if(t&&t.indexOf("@")>-1){var r=t.split("@");return 2===r.length&&e===r[0]}return!1},t.isMaskedUsername=function(e,t){return(t.indexOf("*")>-1||t.indexOf(String.fromCharCode(8226))>-1)&&(e.length===t.length&&(e[0]===t[0]||e[e.length-1]===t[t.length-1]))},t}();e.SiteParser=t}(LPUtils||(LPUtils={}));var lastpass;!function(e){var t=function(){function e(e,t,r,s){void 0===t&&(t=""),void 0===r&&(r=""),void 0===s&&(s=!1),this.url=e,this.userName=t,this.password=r,this.suppliedBefore=s,this.cancelled=!1}return e}();e.AuthCredential=t}(lastpass||(lastpass={}));var lastpass;!function(e){var t=function(){function t(){this.authCredentials={},this.subscribeEvents()}return t.prototype.subscribeEvents=function(){var t=this;LPPlatform.onAuthRequired(function(r,s){if(g_basicauth_feature_enabled&&"basic"===r.scheme){var i=t.authCredentials[r.tabId];if(i&&!i.cancelled&&!i.suppliedBefore)return t.authCredentials[r.tabId]=new e.AuthCredential(r.url,i.userName,i.password,!0),t.removeAuth(s),{authCredentials:{username:i.userName,password:i.password}};if(!i)return t.authCredentials[r.tabId]=new e.AuthCredential(r.url),{cancel:!0}}}),LPPlatform.onTabClosed(function(e){t.removeAuth(e)})},t.prototype.removeAuth=function(e){this.authCredentials[e]&&delete this.authCredentials[e]},t.prototype.isBasicAuth=function(e,t){var r=this.authCredentials[t.tabID];if(r){if(r.url!==t.tabURL)return e(!1,!1),void this.removeAuth(t.tabID);if(!r.cancelled)return void e(!0,r.suppliedBefore)}e(!1,!1)},t.prototype.setAuthCredential=function(e,t,r,s){var i=this.authCredentials[s.tabID];i.userName=e,i.password=t,r()},t.prototype.cancelBasicAuth=function(e){if(this.authCredentials[e.tabID]){this.authCredentials[e.tabID].cancelled=!0}},t.prototype.hasFeature=function(e){e(!0)},t.prototype.isNotificationClosed=function(e){e("closed"===localStorage_getItem("basicAuthPopupState"))},t.prototype.closeNotification=function(){localStorage_setItem("basicAuthPopupState","closed")},t}();e.BasicAuth=t}(lastpass||(lastpass={})),this.basicAuth=new lastpass.BasicAuth;