// URLs
const UNINSTALL_URL = "https://c306.net/whygo.html?src=dT&utm_source=dT%20for%20chrome&utm_medium=chrome_projects&utm_content=uninstall&utm_campaign=chrome_projects";
const UPDATE_NOTES_URL = "https://updatenotes.wordpress.com/category/clutterfree/?src=dT&utm_source=dT%20for%20chrome&utm_medium=chrome_projects&utm_content=extensionupdated&utm_campaign=chrome_projects"
const DONATE_URL = "https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=GD2XSXXL34SDG";
const CHROME_NEW_TAB_URL = "chrome://newtab";

const POPUP_URL = "popup.html";

// From workhorse
const INIT = "init";
const SUSPENDERPREFIX = /chrome\-extension\:\/\/klbibkeccnjlkjkiokjodocebajanakg\/suspended.html\#(?:ttl=.+?\&)?uri=/; //#ttl=.+?\&#uri=
const MIN_DUPLICATES_NOTIFICATION_DISPLAY = 20; //min weekly closed to show notification
const MIN_SHOW_STATS_PAGE = 50; //min total closed to show stats link & button

const TRAILING_SLASH_REGEX = /^(\S+?)(\/)((?:(?:#|\?)\S+)?$)/;
const POCKET_PAGE_REGEX = /getpocket.com\/(a|beta)/i;
const REMOVE_HASH_REGEX = /\/?\#.+$/;

// From bgscript
const OFF_COLOUR = [232, 88, 69, 255];
const ON_COLOUR = [10, 187, 10, 255];

const MOVE_TAB_DONT_MOVE = "dont_move";
const MOVE_TAB_TO_DUPLICATE_POSITION = "to_duplicate_location";
const MOVE_TAB_TO_WINDOW_END = "to_window_end";

// From stats
const MIN_TOTALS_DISPLAY_NOTIFICATION = 1; //min total needed to show a totals item
const MIN_GRAPH_ITEMS = 5; // min line items needed to show a graph
const GRAPH_WEEK_THRESHOLD = 3; //if >=3 weeks of data, show weekly graph, else show daily
const MAX_DOMAIN_ARR_ROWS = 9; //max 10 rows = limiter is 9


// Icons
const ICON_CLOSE_DUPLICATES = chrome.runtime.getURL("/img/icon_tab_close.svg");
const ICON_DONATE = chrome.runtime.getURL("/img/donate.png");
const ICON_GO_TO_ORIGINAL = chrome.runtime.getURL("/img/ic_tab.svg");
const ICON_KEEP_ALL_TABS = chrome.runtime.getURL("/img/icon_stop.svg");
const ICON_NOTIFICATION = chrome.runtime.getURL("/img/cf128.png");
const ICON_OPEN_SETTINGS = chrome.runtime.getURL("/img/settings.svg");
const ICON_OPEN_STATS = chrome.runtime.getURL("/img/stats_button_icon.svg");
const ICON_SHOW_CHANGE_NOTES = chrome.runtime.getURL("/img/changes.svg");

// Notification IDs
const NOTIFICATION_DUPLICATE_CLOSED = "notification_duplicate_closed";
const NOTIFICATION_DUPLICATES_FOUND = "duplicatesFoundNotification";
const NOTIFICATION_EXTENSION_UPDATED = "extensionUpdatedNotification";
const NOTIFICATION_PREVIOUS_DUPLICATES_REMOVED = "previousDuplicatesRemovedNotification";
const NOTIFICATION_TABS_RESTORED = "tabsRestoredNotification";
const NOTIFICATION_URL_WHITELISTED = "urlWhitelistedNotification";
const NOTIFICATION_WEEKLY_STATS = "weeklyStatsNotification";

// Storage
const SYNC_STORAGE_NAME = "sync";
const LOCAL_STORAGE_NAME = "local";


// Default settings
const DEFAULT_ALLOWDUPLICATESACROSSWINDOWS = false;
const DEFAULT_BROWSERACTION = "popup";
const DEFAULT_CLOSED_DUPLICATES = [];
const DEFAULT_DONATED = false;
const DEFAULT_IGNOREHASH = false;
const DEFAULT_LINKMARKERS = false;
const DEFAULT_MOVEORIGINALTAB = MOVE_TAB_TO_DUPLICATE_POSITION;
const DEFAULT_MOVETABTOWINDOWEND = false; // @deprecated
const DEFAULT_POPUP_STATE = "search";
const DEFAULT_REFRESHORIGINAL = false;
const DEFAULT_SEARCHALLWINDOWS = true;
const DEFAULT_SHOWCONTEXTMENU = "duplicate,whitelist,moveToLast,whitelist_domain";
const DEFAULT_SHOWCOUNT = true;
const DEFAULT_SHOWNOTIFICATIONS = true;
const DEFAULT_SHOWWEEKLYSTATSNOTIFICATIONS = true;
const DEFAULT_STARTSTATE = "on";
const DEFAULT_SYNCSTORAGE = false;
const DEFAULT_WEEKLYNOTIFICATIONTIMESTAMP = 0;
const DEFAULT_WHITELIST = ["chrome://newtab","about:blank","chrome://extensions"];
const DEFAULT_EXTENSION_ENABLED = true;


// GA Track
const GA_BROWSER_ACTION_BUTTON_TRACK = "browser_action_button_action";
const GA_BROWSER_ACTION_CONTEXT_MENU_TRACK = "browser_action_context_menu_action";
const GA_COMMAND_TRACK = "command_action";
const GA_DONATED_TRACK = "donated";
const GA_EXTENSION_PAGE_TRACK = "extension_page_opened";
const GA_NOTIFICATION_TRACK = "notification_action";
const GA_PAGE_CONTEXT_MENU_TRACK = "page_context_menu_action";
const GA_POPUP_TRACK = "popup_action";
const GA_SETTINGS_CHANGED_TRACK = "settings_changed_action";

const GA_OPTION_PAGE_LINKS_TRACK = "options_page_links_action";
const GA_POPUP_PAGE_LINKS_TRACK = "popup_page_links_action";


// TODO: Replace button_ with _button
const BUTTON_CLOSE_DUPLICATES = "close_duplicates_button";
const BUTTON_DONATE = "donate_button";
const BUTTON_GO_TO_ORIGINAL = "button_go_to_original"
const BUTTON_KEEP_DUPLICATES = "keep_duplicates_button";
const BUTTON_OPEN_OPTIONS = "open_options_button";
const BUTTON_SHOW_CHANGES = "showChanges_button";
const BUTTON_SHOW_STATS = "show_stats_button";


// GA Actions
const ACTION_ABOUT_PAGE_OPEN = "about_page";
const ACTION_ADD_TO_WHITELIST = "add_to_whitelist";
const ACTION_ADD_TO_WHITELIST_DOMAIN = "add_to_whitelist_domain";
const ACTION_CLOSE_PRE_EXISTING_DUPLICATES = "close_pre_existing_duplicates";
const ACTION_DONATED = "donated";
const ACTION_DUPLICATE_TAB = "duplicate_tab";
const ACTION_GO_TO_ORIGINAL = "notification_click_go_to_original"
const ACTION_MOVE_TO_LAST = "move_to_last";
const ACTION_OPEN_CONFIGURECOMMANDS = "configureCommands";
const ACTION_OPEN_SETTINGS = "open_settings";
const ACTION_OPTIONS_PAGE_OPEN = "options_page";
const ACTION_POPUP_PAGE_OPEN = "popup_page";
const ACTION_RESTORE_LOST_TABS = "restore_lost_tabs";
const ACTION_SHOW_CHANGES = "show_changes";
const ACTION_SHOW_STATS = "show_stats";
const ACTION_STATS_PAGE_OPEN = "stats_page";
const ACTION_TOGGLE_EXTENSION_STATE = "toggle_extension_state";
const ACTION_WHITELIST_ADD = "whitelist_add";
const ACTION_WHITELIST_REMOVE = "whitelist_remove";
const ACTION_POPUP_STATE_CHANGE = "popup_state_change";
const ACTION_SWITCH_TO_TAB = "switch_to_tab";
const ACTION_CLOSE_TAB = "close_tab";

const SOURCE_KEYBOARD = "keyboard";
const SOURCE_TOUCH = "touch";

// GA Settings
const SETTING_ALLOW_DUPLICATES_ACROSS_WINDOWS = "allow_duplicates_across_windows";
const SETTING_BROWSER_ACTION = "browser_action";
const SETTING_IGNORE_HASH = "ignore_hash";
const SETTING_MOVE_ORIGINAL_TAB = "move_original_tab";
const SETTING_ORIGINAL_TAB_BEHAVIOUR = "original_tab_behaviour";
const SETTING_REFRESH_ORIGINAL = "refresh_original";
const SETTING_SEARCH_ALL_WINDOWS = "search_all_windows";
const SETTING_SHOW_CONTEXT_MENU = "show_context_menu";
const SETTING_SHOW_COUNT = "show_count";
const SETTING_SHOW_LINK_MARKERS = "show_link_markers";
const SETTING_SHOW_NOTIFICATIONS = "show_notifications";
const SETTING_SHOW_STATS_NOTIFICATIONS = "show_stats_notifications";
const SETTING_START_STATE = "start_state";
const SETTING_SYNC_STORAGE = "sync_storage";
const SETTING_WHITELIST_MODIFIED = "whitelist_modified";



const COMMAND_DUPLICATE = "duplicate";
const COMMAND_MOVE_TO_LAST = "moveToLast";
const COMMAND_TOGGLE_STATE = "toggleState";
const COMMAND_WHITELIST = "whitelist";
const COMMAND_WHITELIST_DOMAIN = "whitelist_domain";

const BROWSER_ACTION_DUPLICATE = "duplicate";
const BROWSER_ACTION_MOVE_TO_LAST = "moveToLast";
const BROWSER_ACTION_TOGGLESTATE = "toggleState";
const BROWSER_ACTION_WHITELIST = "whitelist";
const BROWSER_ACTION_WHITELIST_DOMAIN = "whitelist_domain";

const CONTENT_CONTEXT_MENU_DUPLICATE = "content_duplicate";
const CONTENT_CONTEXT_MENU_MOVETOLAST = "content_moveToLast";
const CONTENT_CONTEXT_MENU_WHITELIST = "content_whitelist";
const CONTENT_CONTEXT_MENU_WHITELIST_DOMAIN = "content_whitelist_domain";

const BROWSER_ACTION_CONTEXT_MENU_CLOSEALLDUPLICATES = "browserAction_closeAllDuplicates";
const BROWSER_ACTION_CONTEXT_MENU_DUPLICATE = "browserAction_duplicate";
const BROWSER_ACTION_CONTEXT_MENU_RESTORELOST = "browserAction_restoreLost";
const BROWSER_ACTION_CONTEXT_MENU_TOGGLESTATE = "browserAction_toggleState";
const BROWSER_ACTION_CONTEXT_MENU_WHITELIST = "browserAction_whitelist";

const BROWSER_ACTION_CONTEXT_MENU_LIST = ["toggleState", "toggleState_separator", "duplicate", "whitelist", "closeAllDuplicates", "restoreLost"];




const ALARM_STATS = "weeklyStatsAlarm";
const ALARM_TABCLEANER = "tabListCleaner";
const ALARM_EXTENSION_INSTALLED_CHECK_DUPLICATES = "extension_installed_check_duplicates";

// Message passing constants
const MESSAGE_GET_TAB_LIST = "get_tab_list_message";
const MESSAGE_STATE_UPDATED = "state_updated_message";
const MESSAGE_SWITCH_TO_TAB = "switch_to_tab_message";
const MESSAGE_TAB_ADDED = "tab_added_message";
const MESSAGE_TAB_REMOVED = "tab_removed_message";
const MESSAGE_TAB_UPDATED = "tab_updated_message";
