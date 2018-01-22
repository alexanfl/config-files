var chartObj, hoverItem, plot;
var dataSeriesObj = {};
var plotOptions = {
  series: {
    bars: {
      show: true,
      align: "center",
    },
  },
  xaxis: {
    mode: "time",
    tickLength: 0,
  },
  yaxis: {
    minTickSize: 1,
    tickDecimals: 0,
    tickLength: 0,
  },
  tickFormatter: (val, axis) => {
    let d = new Date(val);
    return d.toLocaleDateString();
  },
  grid:{
    borderWidth: {
      top: 1,
      right: 1,
      bottom: 2,
      left: 2,
    },
    borderColor: "rgba(130,130,130,0.6)",
    hoverable: true,
    autoHighlight: true,
  },
};


$(document).ready(() => {
  
  let appName = chrome.i18n.getMessage("appName");
  let shortName = chrome.i18n.getMessage("shortName");
  $("#extShortName").text(shortName);
  $("#extName").text(appName);
  $("title").text("Stats - " + appName);
  
  loadHelpMessages();
  positionHelps();
  
  $("#cx-edit-help-content div").hover(
    e => $(e.currentTarget).css("display", "inherit"),
    e => $(e.currentTarget).css("display", "none")
  );

  $("section").hover(
    e => $("#"+e.currentTarget.id+"Help").css("visibility", "visible"),
    e => $("#"+e.currentTarget.id+"Help").css("visibility", "hidden")
  );

  $("section *").focusin(
    e => $("#"+$(currentTarget).parents("section").attr("id")+"Help").css("visibility", "visible"),
    e => $("#"+$(currentTarget).parents("section").attr("id")+"Help").css("visibility", "hidden")
  );
  
  $(document).resize(() => positionHelps());
  
  loadCounts();
  loadChart();
  
  chrome.storage.sync.get({"donated": DEFAULT_DONATED}, 
    st => showDonate(st["donated"] === true)
  );
  
  
  $(".btnDonate").on("click", () => {
    chrome.storage.sync.set({"donated": true});
    chrome.extension.getBackgroundPage().trackButton("donated", true, "statsTop");
    showDonate(true);
    return true;
  });

});


function loadCounts(){
  
  chrome.storage.local.get({"closedDuplicates": []}, (st) => {
    
    // Calculate weekly & monthly totals
    let weeklyCount = 0, monthlyCount = 0;
    const THIS_WEEK = weekNumber((new Date()).valueOf());
    const THIS_MONTH = (new Date()).getMonth();
    let domainObj = {};
    
    for (let i = 0; i < st.closedDuplicates.length; i++){
      
      let thisDomainObj = new URL(st.closedDuplicates[i].url);
      let thisDomain = /chrome(?:-extension)?\:/.test(thisDomainObj.protocol) ? thisDomainObj.origin : thisDomainObj.hostname;
      
      if(weekNumber(st.closedDuplicates[i].timestamp) === THIS_WEEK)
        weeklyCount++;
      
      if((new Date(st.closedDuplicates[i].timestamp)).getMonth() === THIS_MONTH)
        monthlyCount++;
      
      if(domainObj[thisDomain])
        domainObj[thisDomain]++;
      else
        domainObj[thisDomain] = 1;
    }
    
    if(weeklyCount >= MIN_TOTALS_DISPLAY_NOTIFICATION)
      $("#weekCount").text(weeklyCount.toLocaleString());
    else
      $("#week").hide();
    
    if(monthlyCount >= MIN_TOTALS_DISPLAY_NOTIFICATION)
      $("#monthCount").text(monthlyCount.toLocaleString());
    else
      $("#month").hide();
    
    if(st.closedDuplicates.length === 0){
      
      $("#nada").show();
      
      $("#totalsSection, #domainsSection").hide();
      
    
    } else {
      
      $("#totalCount").text(st.closedDuplicates.length.toLocaleString());
    
      // Sort domainObj
      let domainArr = Object.keys(domainObj)
        .map(key => [key, domainObj[key]])
        .sort(function(a, b) {return b[1] - a[1]});  
      
      let rowString = "";
      
      for (let i = 0; i < Math.min(domainArr.length, MAX_DOMAIN_ARR_ROWS); i++){
        rowString+="<tr><td>" + domainArr[i][0] + "</td><td>" + domainArr[i][1] + "</td></tr>";
      }
      
      if(domainArr.length > MAX_DOMAIN_ARR_ROWS){
        
        let otherCount = 0;
        
        for (let i = MAX_DOMAIN_ARR_ROWS + 1; i < domainArr.length; i++){
          otherCount += domainArr[i][1];
        }
        
        rowString+="<tr><td>Others</td><td>" + otherCount + "</td></tr>";
      }
      
      $("#domainStats tbody").html(rowString);
    }
  });
}


function loadChart(){
  
  chrome.storage.local.get({"closedDuplicates": []}, st => {
    
    if(st.closedDuplicates.length > 0){
      
      // Calculate weekly counts
      let chartDataArr = [];
      let chartDataObj = {};
      let chartTick = "week";
      let currentPeriod;
      
      // Weekly graph
      if(weekNumber(st.closedDuplicates[st.closedDuplicates.length-1].timestamp) - weekNumber(st.closedDuplicates[0].timestamp) > GRAPH_WEEK_THRESHOLD){
        
        for (let i = 0; i < st.closedDuplicates.length; i++){
          
          let weekNum;
          let thisDomainObj = new URL(st.closedDuplicates[i].url);
          let thisDomain = /chrome(?:-extension)?\:/.test(thisDomainObj.protocol) ? thisDomainObj.origin : thisDomainObj.hostname;
          
          weekNum = weekNumber(st.closedDuplicates[i].timestamp);
          
          weekNum = getDateOfISOWeek(weekNum.substr(4), weekNum.substr(0, 4)).valueOf();
          
          if(chartDataObj[weekNum]){
            chartDataObj[weekNum] += 1;
            dataSeriesObj[weekNum].push(thisDomain);
          }
          else{
            chartDataObj[weekNum] = 1;
            dataSeriesObj[weekNum] = [thisDomain];
          }
        }
        
        currentPeriod = weekNumber((new Date()).valueOf());
        currentPeriod = getDateOfISOWeek(currentPeriod.substr(4), currentPeriod.substr(0, 4)).valueOf();
        
        plotOptions.series.bars.barWidth = 7*24*3600*1000;
        plotOptions.xaxis.minTickSize = [1, "day"];
        plotOptions.series.bars.align = "left";
        
        $("#chartTitle").text("Weekly");
        
      }
      
      // Daily graph
      else {
        
        let date;
        
        for (let i = 0; i < st.closedDuplicates.length; i++){
          
          date = (new Date(st.closedDuplicates[i].timestamp)).setUTCHours(0,0,0,0).valueOf();
          
          if(chartDataObj[date]){
            chartDataObj[date] += 1;
            dataSeriesObj[date].push((new URL(st.closedDuplicates[i].url)).hostname);
          }
          else {
            chartDataObj[date] = 1;
            dataSeriesObj[date] = [(new URL(st.closedDuplicates[i].url)).hostname];
          }
        }
        
        currentPeriod = (new Date()).setUTCHours(0,0,0,0).valueOf();
        
        plotOptions.series.bars.barWidth = 12*3600*1000;
        plotOptions.xaxis.minTickSize = [1, "day"];
        
        $("#chartTitle").text("Daily");
        
      }
      
      // Add today's period - date/week
      if(!chartDataObj[currentPeriod]){
        chartDataObj[currentPeriod] = 0;
        dataSeriesObj[currentPeriod] = [];
      }
      
      // Create chartDataArr
      for(let key in chartDataObj){
        chartDataArr.push([key, chartDataObj[key]]);
        $.unique(dataSeriesObj[key]);
      }
      
      // Plot the graph
      if(chartDataArr.length > MIN_GRAPH_ITEMS)
        plot = $("#chartDiv").plot([chartDataArr], plotOptions).data("plot");
      
      // Indicate not enough data for a graph
      else
        $("#chartDiv").text("Need more data for a chart. Please check again in a few days.").css("height", "auto");
      
      
      // Add event listener to add tooltips to graph
      $("#chartDiv").bind("plothover", (event, pos, item) => {
        
        if(item){
          
          let x = item.datapoint[0].toFixed(0),
              y = item.datapoint[1].toFixed(0);
          
          $("#tooltip").html(`<center><strong>${y} duplicates</strong></center><ul><li>${dataSeriesObj[x].join("</li><li>")}</li></ul>`)
          .css({
            top: item.pageY-30, 
            left: `calc(${item.pageX}px - 0.7em)`
          })
          .show();
        } 
        
        else if(!$("#tooltip").is(":hover"))
          $("#tooltip").hide();
        
      });
    }
    
    else
      $("#chartSection").hide();
  });
}


function showDonate(donated){
  if(donated){
    $(".preDonate").hide();
    $(".postDonate").show();
    $(".btnDonate").removeClass("btn-red").addClass("btn-green");
  } else {
    $(".postDonate").hide();
    $(".preDonate").show();
    $(".btnDonate").removeClass("btn-green").addClass("btn-red");
  }
}


function loadHelpMessages(){
  $("#cx-edit-help-content div").each(function(){
    $("#"+this.id).html(chrome.i18n.getMessage(this.id));
  });
}


function positionHelps(){
  $("section").each(function(){
    $("#"+this.id+"Help").css({
      top: $(this).position().top-37,
    });
  });
}


// Input is timestamp
function weekNumber(d) { 
  
  // Create a copy of this date object  
  let target  = new Date(d);  
  
  // ISO week date weeks start on monday  
  // so correct the day number  
  let dayNr   = (target.getDay() + 6) % 7;  
  
  // Set the target to the thursday of this week so the  
  // target date is in the right year  
  target.setDate(target.getDate() - dayNr + 3);  
  
  // ISO 8601 states that week 1 is the week  
  // with january 4th in it  
  let jan4    = new Date(target.getFullYear(), 0, 4);  
  
  // Number of days between target date and january 4th  
  let dayDiff = (target - jan4) / 86400000;    
  
  // Calculate week number: Week 1 (january 4th) plus the    
  // number of weeks between target date and january 4th    
  let weekNr = 1 + Math.ceil(dayDiff / 7);    
  
  return target.getFullYear() + "" + weekNr;
}


function getDateOfISOWeek(w, y) {
  let simple = new Date(y, 0, 1 + (w - 1) * 7);
  let dow = simple.getDay();
  let ISOweekStart = simple;
  
  if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  
  return ISOweekStart;
}


function getDateOfWeek(w, y) {
    let d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week

    return new Date(y, 0, d);
}
