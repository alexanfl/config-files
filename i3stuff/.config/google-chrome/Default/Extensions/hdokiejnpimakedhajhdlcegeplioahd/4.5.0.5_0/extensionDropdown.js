ExtensionDropdown=function(e){var t=$(e.body),n=e.getElementById("items"),i=e.getElementById("searchResults"),o=e.getElementById("recentSites"),a=e.getElementById("identitiesMenuItem"),l=e.getElementById("matchingSitesTopLevel"),s=e.getElementById("matchingSites"),r=e.getElementById("addCustomItems"),c=$("#topLevelContainer"),d=$("#vaultMenuItem"),u=$("#addOmariaItems"),p=$("#allItems"),m=$("#groupLabel"),g=$("#backButton"),f=$("#debugconsole"),b=$("#encryptedExportMenuItem"),v=$("#wifiExportMenuItem"),h=$("#matchingSitesMenuItem"),P=$("#recentSitesMenuItem"),I=$("#container"),y=$("#searchInput"),L=$("#applicationsMenuItem"),S=null,T=function(){LPPlatform.setDropdownPopoverSize(I.outerHeight(),I.outerWidth())},_=null,C=null,E=null,w=null,M=null,x=null,k=null,D=null,A=null,O=null,F=null,B=null,N=!1,R=!1,H=!1,V=!1,G={},K=null,z={},U=[],j={},W=function(e){if(m.empty(),e){var t=e.getName();t=t.replace(/\\/g," \\ ");var n=t.indexOf("\\",t.length/2);if(-1===n&&(n=t.lastIndexOf("\\")),n>0){var i=LPTools.createElement("div","textOverflowContainer groupLabel");i.appendChild(LPTools.createElement("span",null,t.substring(0,n))),m.append(LPTools.createElement("span","textTail"," "+t.substring(n))),m.append(i),LPTools.setupMiddleEllipsis(m)}else m.append(LPTools.createElement("span","groupLabel",t));m.find(".groupLabel").attr("title",e.toString())}};j.GroupState=function(e){var t=LPTools.getNavIndex();this.pop=function(n){e.rebuildItems(null,n),n&&LPTools.setNavIndex(t),W(e._model)}},j.SearchState=function(){var e=new j.CSSState("searchItem",{restoreKeyboardNav:!1});this.pop=function(){pe(),e.pop()}},j.TopLevelMatchingSitesState=function(e){var t=new j.CSSState("matchingSites"),n=new j.GroupState(e);this.pop=function(){n.pop(),t.pop()}},j.CSSState=function(){var e=t.attr("class"),n=function(n){t.removeClass(e),t.addClass(n),e=n};return function(t,i){var o=e;if(n(t),LPTools.getOption(i,"applyKeyboardNav",!0)){var a=LPTools.getOption(i,"selectFirst",!1);LPTools.addKeyBoardNavigation($(".extensionMenuItem:visible"),{selectFirst:a})}this.pop=function(){W(null),n(o),LPTools.getOption(i,"restoreKeyboardNav",!0)&&LPTools.addKeyBoardNavigation($(".extensionMenuItem:visible"),{displayItems:0===U.length&&B?B.getItems():null}),i&&"function"==typeof i.onPop&&i.onPop()}}}();var Y=function(){LPTools.parseUserSpecificMenu(e.getElementById("mainMenu"),LPProxy.getAccountClass()),$("#username").text(bg.get("g_username"))},Z=function(){Q();var e=bg.get("LPContentScriptFeatures").ziggy,t=bg.get("LPContentScriptFeatures").omaria;S={isZiggySet:e,isOmarSet:t,showHelpText:e};var n=function(){q(),le(),de(S),Y(),setTimeout(function(){X(S,0)}),e||($("#mainMenu").addClass("showIcons"),J()),bg.sendLpImprove("openicondropdown")},i=LPPlatform.getExtensionDropdownDelay();i>=0?setTimeout(n,i):n()},q=function(){I.addClass("loading")},J=function(){T(),I.addClass("initialized"),LPTools.addKeyBoardNavigation($(".extensionMenuItem:visible"),{displayItems:B?B.getItems():null}),y.focus()},Q=function(){LPFeatures.updateFeatures({import:!0,noexport:!1,show_notes:!0,hideidentities:!1,show_formfills:!0})},X=function(e){LPProxy.initializeModel(),se(e),te(e),R=!0,I.removeClass("loading");for(var t in z)z[t]();var n=y.val();n&&me(n)},ee=function(e,t){var t=t||{};return LPProxy.getPreference("showAcctsInGroups",!0)&&(e=LPProxy.assignItemsToGroups(e,!1),t.separateFavorites=!0),new Container(e,t)},te=function(e){e.isOmarSet?(E=new Container(LPProxy.getAllItems(),$.extend({},e,{omarItems:!0,trackAction:!0})),E.setElement(n),O=new Container(LPProxy.getCustomNoteTemplates().map(function(e){return new AddCustomItemDisplay(e)}),$.extend({},e,{additionalItemClasses:"addOmariaItem",autoExpandSingleItem:!1,value:"Custom"})),oe(O.getItemCount())):(w=ee(LPProxy.getSites(),e),w.setElement(n),M=ee(LPProxy.getNotes(),e),M.setElement(n),x=new Container(LPProxy.getFormFills(),e),x.setElement(n),k=new Container(LPProxy.getApplications(),e),k.setElement(n)),A=new Container(LPProxy.getAllItems(),$.extend({},e,{moreOptionsState:j.SearchState}))},ne=function(e){var t=["extensionMenuItem","omariaMenuItem"];e&&e.attrs&&e.attrs.class&&(t=t.concat(e.attrs.class));var n=$.extend({},e.attrs,{class:t}),i=LPTools.createElement("li",n);return i.appendChild(LPTools.createElement("i",e.icon+" menuIcon")),i.appendChild(LPTools.createElement("span","name",e.name)),e.addMoreButton&&i.appendChild(LPTools.createElement("div","more")),n.childView&&$(i).bind("click",xe),e.onClick&&$(i).bind("click",e.onClick),i},ie=function(e,t){switch(t&&E.applyFilter({showEmptyGroups:!1,func:function(e){return e instanceof GroupDisplay||e.getRecordType()===t}}),E.rebuildItems(n,!e.originalEvent.isTrusted),t){case"Account":Me(E,"Empty_Site_Omaria",Strings.translateString("You can save and fill usernames and passwords for any website or app."),Strings.translateString("Add a password"),t);break;case"Generic":Me(E,"Empty_Note_Omaria",Strings.translateString("Use a secure note to save important documents in your LastPass vault."),Strings.translateString("Add a secure note"),t);break;case"Address":Me(E,"Empty_Address_Omaria",Strings.translateString("Add an address to auto-fill your email, phone number, and other contact info."),Strings.translateString("Add an address"),t);break;case"Credit Card":Me(E,"Empty_Credit_Card_Omaria",Strings.translateString("Next time you go shopping, they'll be waiting!"),Strings.translateString("Add a payment card"),t);break;case"Bank Account":Me(E,"Empty_Bank_Account_Omaria",Strings.translateString("Save and fill your bank accounts securely on any device with LastPass."),Strings.translateString("Add a bank account"),t)}},oe=function(e){var t=LPProxy.getRecordConfig(),n=LPProxy.getAllModelTypes();t.viewConfig.forEach(function(i){if(i.forEach(function(i){if("all"!==i){var o=LPProxy.getConfigViewObject(i);o.types.forEach(function(i){var a=LPProxy.getConfigTypeObject(i);(o.default||n.includes(a.recordType))&&p.append(ne({attrs:{class:"omariaItem",childView:"omariaItems"},name:o.name,icon:t.icons[a.id],addMoreButton:!0,onClick:function(e){ie(e,a.recordType)}}));var l=null;a.recordType===t.TYPE.Custom?e>0&&(l=ne({attrs:{class:"addOmariaItem",childView:"addCustomItems"},name:a.name,icon:t.icons[a.id],addMoreButton:!0,onClick:function(e){O.rebuildItems(r,!e.originalEvent.isTrusted)}})):l=ne({attrs:{class:"addOmariaItem"},name:a.name,icon:t.icons[a.id],onClick:function(){ae(a.recordType)}}),l&&u.append(l)})}}),i!==t.viewConfig[0]){if(!p[0].lastChild.classList.contains("omarSpacer")){var o=LPTools.createElement("li","omarSpacer");p.append(o)}var a=LPTools.createElement("li","omarSpacer");u.children().last().hasClass("omarSpacer")||u.append(a)}});var i=LPTools.createElement("li",{class:"extensionMenuItem addOmariaItem",value:"saveAll"},Strings.translateString("Save All Entered Data"));u.append(i),$('.addOmariaItem[value="saveAll"]').bind("click",function(){bg.lpevent("m_saed"),bg.get_selected_tab_data(null,function(e){bg.sendLpImprove("save_all_entered_data",{domain:bg.lp_gettld_url(e.url)})}),bg.saveall()})},ae=function(e){bg.lpevent("m_add"),"Account"===e?bg.get_selected_tab_data_no_extension(null,function(e){Pe({defaultData:{url:e?e.url:""}})}):Ie({defaultData:{notetype:e}})},le=function(){f.LP_removeAttr("style"),b.LP_removeAttr("style"),v.LP_removeAttr("style"),L.LP_removeAttr("style"),bg.is_user_debug_enabled()&&f.show(),bg.have_binary()&&(b.show(),bg.LPPlatform.isWin()&&v.show()),LPTools.hasProperties(bg.get("g_applications"))&&L.show(),LPFeatures.allowNotes()?$("#notesMenuItem").show():$("#notesMenuItem").hide()},se=function(t){if(t.isOmarSet&&(a=e.getElementById("omarIdentitiesMenuItem")),C=LPProxy.getIdentities(),LPProxy.enableCurrentIdentity(C),C.length>0){ge(_);for(var n=[],i=0,o=C.length;i<o;++i)n.push(C[i].newDisplayObject());new IdentityContainer(n,t).initialize(e.getElementById("identities"))}else $(a).hide()},re=function(e){return!0===G[e]},ce=function(e,t,n){var i,o,a=function(e){var t=bg.lpmdec(e.extra,!0),n=/Language:(.+)/.exec(t);return n&&n.length>1?n[1].substr(0,2):"en"},l=[],s=[];for(i=0,o=K.length;i<o;++i){var r=LPProxy.getNoteModel(K[i].aid);if(r){var c=a(r._data);-1===s.indexOf(c)&&s.push(c)}}for(i=0,o=K.length;i<o;++i){var d=K[i].aid;if("account"===K[i].type)l.push(new MatchingAccountDisplay(LPProxy.getSiteModel(d)));else if("note"===K[i].type){var u=LPProxy.getNoteModel(d);l.push(new MatchingNoteDisplay(u,s.length>1?a(u._data):null))}}B=new Container(l,t),B.setElement(e),B.rebuildItems()},de=function(t){K=bg.getmatchingsites(!1,!0,!1);for(var n=0,i=K.length;n<i;++n)G[K[n].aid]=!0;t.isZiggySet||LPProxy.getPreference("toplevelmatchingsites",!1)?(P.addClass("divider"),d.addClass("divider"),c.removeClass("hidden"),K.length>2?d.addClass("topLevelMatchesShadow"):(d.removeClass("topLevelMatchesShadow"),0===K.length&&(d.removeClass("divider"),c.addClass("hidden"))),fe("topLevelMatchingSites",function(){ce(l,$.extend({},t,{autoExpandSingleItem:!1,moreOptionsElement:e.getElementById("matchingSites"),moreOptionsState:j.TopLevelMatchingSitesState,addLastClass:!1,trackAction:!0,sortFunction:VaultItemBaseDisplay.prototype.sortOmarMatchingItems})),J()})()):(0===K.length?h.LP_removeAttr("style"):(h.show(),$("#matchingSiteCounter").text(K.length)),d.removeClass("divider"),d.removeClass("topLevelMatchesShadow"),c.addClass("hidden"))},ue=function(){var e=bg.getClearRecentTime(),t=bg.Preferences.get("recentUsedCount"),n=null;n=bg.get("LPContentScriptFeatures").omaria?E.getItemChildren():w.getItemChildren().concat(M.getItemChildren()),n.sort(VaultItemBaseDisplay.prototype.sortByMostRecent);for(var i=[],a=0,l=n.length;a<l&&a<t;++a){var s=n[a];s.getLastTouchValue()>=e&&i.push(s._model.newDisplayObject())}i.length>0?(F=new Container(i,$.extend({},S,{sortFunction:VaultItemBaseDisplay.prototype.sortByMostRecent})),F.initialize(o)):Le(o)},pe=function(){LPTools.removeDOMChildren(i);for(var e=0,t=D.length;e<t;++e){var n=D[e],o=n.build(S);n.postBuild(o),i.appendChild(o)}if(0===D.length){var a=LPTools.buildEmptyPlaceholder(Strings.translateString("No Matching Results"),"extensionSearchPlaceholder",i);i.appendChild(a)}LPTools.addKeyBoardNavigation(i.children,{rightArrowSelector:".moreItem",selectFirst:!0,displayItems:D})},me=function(){var e=null;return function(t){t.length>0?(R&&(D&&D.forEach(function(e){e.hideInContextOptions()}),D=A.getSearchResultItems(t),pe()),N||(Se("search",{applyKeyboardNav:!1,onPop:function(){y.val("")}}),N=!0,bg.sendLpImprove("search",{source:"icon"}))):e&&e.length>0&&(Te(),N=!1),e=t}}(),ge=function(t){var n=Strings.translateString("Identities")+" ("+t.getName()+")",i=a.firstChild;3!==i.nodeType?(i=e.createTextNode(n),a.insertBefore(i,a.firstChild)):i.textContent=n},fe=function(e,t){return function(){R?t.apply(this,arguments):z[e]=t}},be=function(e){e&&(e.stopPropagation(),e.preventDefault())},ve=function(e){for(var t=null;null!==e&&null===(t=e.getAttribute("childview"));)e=e.parentElement;return t},he=function(e){return e||(e={}),e.saveOptions={source:"icon"},e},Pe=function(e){bg.LPPlatform.openTabDialog("site",he(e))},Ie=function(e){bg.LPPlatform.openTabDialog("note",he(e))},ye=function(e){bg.LPPlatform.openTabDialog("formFill",he(e))},Le=function(e){e.appendChild(LPTools.createElement("li","extensionMenuItem none","None Available"))},Se=function(e,t){U.push(new j.CSSState(e,t))},Te=function(e){var t=U.pop();t&&t.pop(e)},_e=dialogs.generatePassword,Ce=function(){_e.getDialog().close(),g.unbind("click",Ce)},Ee=null,we=function(){!0===bg.get("LPContentScriptFeatures").better_generate_password_enabled&&(_e=dialogs.betterGeneratePassword),_e.open({preSetup:function(e){if(null===Ee){var t=_e.parentElementID,n=e.options.hideHeader,i=e.dynamicHeight;Ee=function(){_e.parentElementID=t,e.options.hideHeader=n,e.useDynamicHeignt(i)}}_e.parentElementID="extensionDropdownGeneratePassword",e.options.hideHeader=!0,e.useDynamicHeignt(!1)},postSetup:function(e){LPPlatform.setDropdownPopoverSize(e.$element.outerHeight()+I.outerHeight(),I.outerWidth())},onClose:function(){Te(),T()},onCopy:function(){LPPlatform.closePopup(!0)},saveOptions:{source:"icon"}}),g.unbind("click",Ce),g.bind("click",Ce)},Me=function(e,t,n,i,o){if(o=o||"Generic",e.isEmpty()){var a=LPTools.createElement("div","emptyView");a.appendChild(LPTools.createElement("img",{src:"images/vault_4.0/"+t+".png",class:"emptyViewIcon"})),a.appendChild(LPTools.createElement("h1","emptyViewText",n));var l=LPTools.createElement("input",{class:"addItem rbtn",type:"button",value:i,tabindex:-1});l.appendChild(LPTools.createElement("i","fa fa-trash")),a.appendChild(l),l.addEventListener("click",function(e){ae(o)}),LPTools.addKeyBoardNavigation($(l),{selectFirst:!0}),document.getElementById("items").appendChild(a)}},$e=function(e,t,n){if(e.isEmpty()){var i=LPTools.createElement("div","emptyView");i.appendChild(LPTools.createElement("img",{src:"images/vault_4.0/"+t,class:"emptyViewIcon"})),i.appendChild(LPTools.createElement("h1","emptyViewText",n)),document.getElementById("items").appendChild(i)}};y.LP_addSearchHandlers("inputDialog",function(e){me(e)}),g.bind("click",Te);var xe=function(e){Se(ve(e.target),{selectFirst:!e.originalEvent.isTrusted}),be(e)};$("[childview]").bind("click",xe),$("#addSite").bind("click",function(e){bg.get_selected_tab_data_no_extension(null,function(e){bg.lpevent("m_add"),Pe({defaultData:{url:e?e.url:""}}),LPPlatform.closePopup()}),e.stopPropagation()}),$("#saveAllEnteredData").bind("click",function(){bg.lpevent("m_saed"),bg.get_selected_tab_data(null,function(e){bg.sendLpImprove("save_all_entered_data",{domain:bg.lp_gettld_url(e.url)})}),bg.saveall()}),$("#addNote").bind("click",function(){bg.lpevent("m_addn"),Ie()}),$("#addFormFill").bind("click",function(){bg.lpevent("m_af"),ye()}),$("#addCreditCard").bind("click",function(){bg.lpevent("m_af"),ye({defaultData:{profiletype:FormFill.prototype.FORM_FILL_TYPE_CREDIT_CARD}})}),$("#clearForms").bind("click",function(){bg.lpevent("m_clrf"),bg.clearforms("icon")});var ke=null;$("#chooseProfile").bind("click",function(){dialogs.chooseProfile.open({preSetup:function(e){if(null===ke){var t=dialogs.chooseProfile.parentElementID,n=e.options.hideHeader;ke=function(){dialogs.chooseProfile.parentElementID=t,e.options.hideHeader=n,e.$element.css("min-height","")}}e.$element.css("min-height",0),dialogs.chooseProfile.parentElementID="chooseProfileCreditCard",e.options.hideHeader=!0},onClose:function(){Te()},saveOptions:{source:"icon"}})}),$("#vaultMenuItem").bind("click",function(){bg.lpevent("m_ov"),bg.openvault()}),$("#sitesMenuItem").bind("click",function(){return fe("sites",function(e){w.rebuildItems(n,!e.originalEvent.isTrusted),$e(w,"Empty_Site.png",Strings.translateString("Remember every password"))})}()),$("#formFillsMenuItem").bind("click",function(){return fe("formFills",function(e){x.rebuildItems(n,!e.originalEvent.isTrusted),$e(x,"Empty_Form.png",Strings.translateString("Fill Every Form"))})}()),$("#applicationsMenuItem").bind("click",function(){return fe("applications",function(e){k.rebuildItems(n,!e.originalEvent.isTrusted),$e(k,"Empty_Site.png",Strings.translateString("Remember every password"))})}()),$("#generateMenuItem").bind("click",we),$("#notesMenuItem").bind("click",function(){return fe("notes",function(e){M.rebuildItems(n,!e.originalEvent.isTrusted),$e(M,"Empty_Note.png",Strings.translateString("Store Every Note"))})}()),$("#clearMostRecent").bind("click",function(){bg.clearrecent(),LPTools.removeDOMChildren(o),Le(o)});var De=fe("mostRecent",function(e){H||(ue(),H=!0),LPTools.addKeyBoardNavigation(o.children,{rightArrowSelector:".moreItem",selectFirst:!e.originalEvent.isTrusted,displayItems:F.getItems()})});P.bind("click",De);var Ae=fe("matchingSites",function(t){V||(ce(s),V=!0),LPTools.addKeyBoardNavigation(e.getElementById("matchingSites").children,{rightArrowSelector:".moreItem",selectFirst:!t.originalEvent.isTrusted})});if(h.bind("click",Ae),$("#prefMenuItem").bind("click",function(){bg.lpevent("m_op"),bg.openprefs()}),$("#helpMenuItem").bind("click",function(){bg.lpevent("m_oh"),bg.openhelp()}),$("#adminConsoleMenuItem").bind("click",function(){bg.lpevent("m_oec"),bg.openentconsole()}),$("#logoutMenuItem").bind("click",function(){bg.lpevent("m_lo"),bg.loggedOut(!1,"menu")}),$("#challengeMenuItem").bind("click",function(){bg.lpevent("m_sec"),bg.openseccheck()}),$("#favoritesMenuItem").bind("click",function(){bg.lpevent("m_of"),bg.openfavorites(!1,"icon")}),$("#aboutMenuItem").bind("click",function(){bg.lpevent("m_abt"),bg.openabout()}),f.bind("click",function(){bg.lpevent("m_dbgcon"),bg.opendebugtab()}),$("#csvExportMenuItem").bind("click",function(){bg.lpevent("m_e"),bg.openexport()}),$("#formFillExportMenuItem").bind("click",function(){bg.lpevent("m_eff"),bg.formfillexport()}),b.bind("click",function(){bg.lpevent("m_elp"),bg.openlastpassexport()}),v.bind("click",function(){bg.lpevent("m_ewlan"),bg.wlanexport()}),$("#printSitesMenuItem").bind("click",function(){bg.lpevent("m_p"),bg.openprint(!1)}),$("#printNotesMenuItem").bind("click",function(){bg.lpevent("m_pn"),bg.openprint(!0)}),$("#refreshMenuItem").bind("click",function(){bg.lpevent("m_ref"),LPProxy.refreshSites()}),$("#clearCachMenuItem").bind("click",function(){bg.lpevent("m_cl"),bg.clearCache(!1,!0,!1)}),$("#myAccountMenuItem").bind("click",function(){bg.lpevent("m_mya"),bg.openmyaccount()}),$("#sessionsMenuItem").bind("click",function(){bg.lpevent("m_ses"),bg.opensessions()}),LPPlatform.addEventListener(window,"unload",function(){Ne()}),t.on("click",".extensionMenuItem, .footer, .contextOptionsDropdown",function(){LPPlatform.closePopup()}),LPFeatures.allowGift()){var Oe=$("#specialOfferMenuItem");Oe.show(),Oe.bind("click",function(){bg.openURL(LPProxy.getBaseURL()+"gift.php")})}$("#omarChallengeMenuItem").bind("click",function(){bg.lpevent("m_sec"),bg.openseccheck()}),$("#omarFavoritesMenuItem").bind("click",function(){bg.lpevent("m_of"),bg.openfavorites(!1,"icon")}),$("#omarPrefMenuItem").bind("click",function(){bg.lpevent("m_op"),bg.openprefs()}),$("#omarHelpMenuItem").bind("click",function(){bg.lpevent("m_oh"),bg.openhelp()}),$("#omarAboutMenuItem").bind("click",function(){bg.lpevent("m_abt"),bg.openabout()}),$("#omarRefreshMenuItem").bind("click",function(){bg.lpevent("m_ref"),LPProxy.refreshSites()}),$("#omarClearCachMenuItem").bind("click",function(){bg.lpevent("m_cl"),bg.clearCache(!1,!0,!1)}),$("#omarSessionsMenuItem").bind("click",function(){bg.lpevent("m_ses"),bg.opensessions()}),Topics.get(Topics.PUSH_STATE).subscribe(function(e){U.push(e)}),Topics.get(Topics.EDIT_SITE).subscribe(function(e){e.vaultItem=e.vaultItem.getID(),Pe(e)}),Topics.get(Topics.EDIT_NOTE).subscribe(function(e){e.vaultItem=e.vaultItem.getID(),Ie(e)}),Topics.get(Topics.EDIT_FORM_FILL).subscribe(function(e){e.vaultItem=e.vaultItem.getID(),ye(e)}),Topics.get(Topics.EDIT_APPLICATION).subscribe(function(e){e.vaultItem=e.vaultItem.getID(),bg.LPPlatform.openTabDialog("application",e)}),Topics.get(Topics.IDENTITY_ENABLE).subscribe(function(e){LPProxy.enableIdentity(e),_=e}),Topics.get(Topics.CONFIRM).subscribe(function(e){Fe("confirmation",e)}),Topics.get(Topics.ERROR).subscribe(function(e){Fe("alert",{title:Strings.Vault.ERROR,text:e})}),Topics.get(Topics.REPROMPT).subscribe(function(e){Fe("reprompt",{successCallback:e})}),Topics.get(Topics.LEFT_ARROW).subscribe(function(){LPTools.disableMouse(),Te(!0)}),Topics.get(Topics.CLEAR_DATA).subscribe(function(){for(var e=U.length-1;e>-1;--e)U[e].pop();U=[],LPTools.setNavIndex(0),y.val(""),N=!1,R=!1,H=!1,V=!1,G={},z={},K=null,Ee&&Ee(),ke&&ke(),I.removeClass("initialized"),p.empty(),u.empty(),Dialog.prototype.closeAllDialogs(!0)}),Topics.get(Topics.INITIALIZED).subscribe(function(){Strings.translate(e.body),LPPlatform.setupDropdownImportMenu(I)});var Fe=function(e,t){$("#container").LP_hide(),LPTools.removeKeyBoardNavigation(),t=$.extend(t,{onResize:function(e,t){LPPlatform.setDropdownPopoverSize(e,t)},onClose:function(){LPPlatform.closePopup()}}),LPDialog.openDialog(e,t)},Be=function(){var e=bg.get("g_badgedata");if(e&&"notification"===e.cmd){switch(e.alerttype){case"duplicate":Fe("duplicatePassword",{notification:e});break;case"weak":Fe("weakPassword",{notification:e})}switch(e.type){case"error":Fe("notification",{notification:bg.get("g_notification_data")})}bg.clear_badge()}else $("#container").LP_show(),Z()},Ne=function(){Topics.get(Topics.CLEAR_DATA).publish()};return{setup:Z,State:j,isMatchingSite:re,setGroupLabel:W,open:Be,openDialog:Fe,reset:Ne,setBigIcons:function(e){bg.set("g_bigicons",e)}}}(document);