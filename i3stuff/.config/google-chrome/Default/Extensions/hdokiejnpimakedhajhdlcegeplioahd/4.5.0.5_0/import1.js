function onLoad(){populate()}function populate(){var e=getBG();e.have_binary_function("get_chrome_passwords")?e.call_binary_function("get_chrome_passwords",function(e){e||(e=[]),g_results=e;for(var t=new Array,r=0;r<g_results.length;r++)(void 0!==g_results[r].username&&""!=g_results[r].username||void 0!==g_results[r].password&&""!=g_results[r].password)&&(t[t.length]=g_results[r]);g_results=t;var s=[];event_handlers={};for(var r in g_results)s.push(getsitehtml(g_results,r));s.push('<div id="gridclear" class="clear"/>'),document.getElementById("gridsite").innerHTML=s.join("");for(var r in event_handlers)document.getElementById(r).addEventListener("click",event_handlers[r]);s=null}):g_isfirefoxsdk||(document.getElementById("needbinaryspan").style.display="inline")}function sp(e,t){e.innerHTML==gs("Show")?set_innertext(e,g_results[t].password):set_innertext(e,gs("Show"))}function getsitehtml(e,t,r){return id=t,name=trunc(e[t].url,MAX_SITENAME_LEN),username=void 0!==e[t].username?trunc(e[t].username,MAX_SITEUSERNAME_LEN):"",event_handlers["link"+id]=function(){sp(this,this.id.substring(4))},'<div class="site" id="site'+id+'"><div class="border"><div class="sitename"><span class="content">'+name+'</span></div><div class="siteusername"><span class="content">'+username+'</span></div><div class="sitepassword"><span class="content"><a id="link'+id+'" href="#">'+gs("Show")+'</a></span></div><div class="siteimport"><input type="checkbox" id="import'+id+'" checked></div></div></div>'}function trunc(e,t){return e.length<=t?e:e.substr(0,t)+"..."}function select_all(){for(var e=0;e<g_results.length;e++)document.getElementById("import"+e).checked=!0}function unselect_all(){for(var e=0;e<g_results.length;e++)document.getElementById("import"+e).checked=!1}function checkdup(e,t){if("http://sn"==e.url)return!1;var r=getBG().getsites(t);for(var s in r){var n=getBG().g_sites[s];if(n&&n.unencryptedUsername==e.username&&getBG().lpmdec_acct(n.password,!0,n,getBG().g_shares)==e.password)return!0}return!1}function lpimport(){for(var e=new Array,t="cmd=uploadaccounts&username="+getBG().en(getBG().g_username),r=0,s=0;s<g_results.length;s++)if(document.getElementById("import"+s).checked){var n=g_results[s],l=getname_url(n.url);if(checkdup(n,lp_gettld_url(n.url)))continue;t+="&url"+r+"="+getBG().en(getBG().bin2hex(punycode.URLToASCII(n.url))),t+="&username"+r+"="+getBG().en(getBG().lpenc(n.username)),t+="&password"+r+"="+getBG().en(getBG().lpenc(n.password)),t+="&type"+r+"=ie",t+="&usernamefield"+r+"="+getBG().en(n.username_field),t+="&passwordfield"+r+"="+getBG().en("*"+n.password_field);for(var a,i=1;i<=1e3;i++)if(a=l,i>1&&(a+=" ("+i+")"),!lp_in_array(a,e)){e[e.length]=a;break}t+="&name"+r+"="+getBG().en(getBG().lpenc(a)),r++,getBG().LPISLOC&&lpImportChromePasswordLocal(n)}getBG().LPISLOC&&(getBG().g_local_accts_version++,getBG().rewritelocalfile()),t+=getBG().get_identity_param(),getBG().lpMakeRequest(base_url+"lastpass/api.php",t,lpUploadAccountsResponse)}function lpImportChromePasswordLocal(e){var t=getBG(),r=t.createNewAcct();r.aid=get_new_id(),r.name=lp_gettld_url(e.url),r.url=e.url;var s=lp_gettld_url(r.url);r.tld=s,r.unencryptedUsername=e.username,r.username=t.lpmenc(e.username,!0),r.password=t.lpmenc(e.password,!0);var n=get_new_id();if(r.urid=n,addfield(r,e.username_field,"text",t.lpmenc(e.username,!0),n),addfield(r,e.password_field,"password",t.lpmenc(e.password,!0),n),void 0===t.g_tlds[r.tld]&&(t.g_tlds[r.tld]={}),t.g_tlds[r.tld][r.aid]=!0,t.add_ident_aid(r.aid),void 0!==t.g_equivalentdomains[s]){var l=t.g_equivalentdomains[s];if(void 0!==t.g_equivalentdomains[l])for(var a=0;a<t.g_equivalentdomains[l].length;a++){var i=t.g_equivalentdomains[l][a];void 0===t.g_tlds[i]&&(t.g_tlds[i]={}),t.g_tlds[i][aid]=!0}}t.g_sites[r.aid]=r}function addfield(e,t,r,s,n){var l=new Object;l.otherfield=!1,l.name=t,l.type=r,l.value=s,l.formname="",l.checked=!1,l.urid=n,l.otherlogin="0",l.url="",e.fields[e.fields.length]=l}function lpUploadAccountsResponse(e){e&&4==e.readyState&&200==e.status&&(e.responseText.indexOf("OK")>0?(getBG().get_accts(),getBG().refresh_windows(),alert(gs("Your Google Chrome passwords have been imported successfully.")),g_fromwelcome?redirect_to_url("configure_formfill.html"):getBG().closecurrenttab("import.html")):alert(gs("An error occurred while importing your Google Chrome passwords.")))}function cancel(){g_fromwelcome?redirect_to_url("configure_formfill.html"):getBG().closecurrenttab("import.html")}function getbinary(){var e=getBG();e&&e.install_binary()}var g_fromwelcome=-1!=document.location.href.indexOf("?fromwelcome=1"),g_results=null,MAX_SITENAME_LEN=30,MAX_SITEUSERNAME_LEN=15;