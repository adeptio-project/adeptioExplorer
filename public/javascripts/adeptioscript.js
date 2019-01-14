    function secToHoursMinSecString(pInt){
        var tmpSec = Math.round(pInt%60);
        pInt = Math.floor(pInt/60);
        var tmpMin = Math.round(pInt%60);
        pInt = Math.floor(pInt/60);
        var tmpHours = pInt;
        return tmpHours + " h " + tmpMin + " min " + tmpSec + " sec";
    }

    function formatMilliseconds(s){
        s = s*1000;
        var ms = s % 1000;
        s = (s - ms) / 1000;
        
        var secs = s % 60;
        s = (s - secs) / 60;
        
        var mins = s % 60;
        s = (s - mins) / 60;

        var hrs = s % 24;
        s = s/24;
        
        var days = Math.trunc(s);

        if (ms<100) ms="0"+ms;
        if (secs<10) secs="0"+secs;
        if (mins<10) mins="0"+mins;
        if (hrs<10) hrs="0"+hrs;
        if (days<10) days="0"+days;

        if (days!="00")
            return days + " days";
        else if (hrs!="00")
            return hrs + ' hours';
        else if (mins!="00")
            return mins + ' min';
        else if (secs!="00")
            return secs + ' sec';
        else
            return ms + ' ms';
    }

    function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}