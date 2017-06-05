<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WAVE</title>
        <link rel="shortcut icon" href="${pageContext.request.contextPath}/resources/img/favicon.ico?v=${initParam.releaseNumber}"/>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/jquery.mobile-1.4.5.min.css"/>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/jtsage-datebox-4.1.1.min.css"/>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/wave.css?v=${initParam.releaseNumber}"/>
    </head>
    <body>
        <div id="header-panel" data-role="header" data-position="fixed" data-theme="a">
            <h1>WAVE</h1>
            <button type="button" data-icon="gear" data-iconpos="notext" id="options-button"></button>
            <button type="button" data-icon="plus" data-iconpos="notext" id="go-button"></button>
            <input type="text" id="pv-input" placeholder="PV Name"/>
        </div>          
        <div data-role="page" id="chart-page">  
            <div data-role="panel" data-position="left" data-display="overlay" id="options-panel">
                <input type="text" id="start-date-input" placeholder="Start Date" data-options="{&quot;overrideDateFormat&quot;: &quot;%b %d %Y&quot;}"/>
                <input type="text" id="start-time-input" placeholder="Start Time"/>
                <input type="text" id="end-date-input" placeholder="End Date" data-options="{&quot;overrideDateFormat&quot;: &quot;%b %d %Y&quot;}"/>
                <input type="text" id="end-time-input" placeholder="End Time"/>
                <button type="button" id="update-datetime-button">Update</button>
                <a id="cancel-datepicker" href="#">Cancel</a>
            </div>
            <div id="chart-container"></div>
        </div>
        <div id="footer-panel" data-role="footer" data-position="fixed" data-theme="a">
            <div id="version">Version: ${initParam.releaseNumber} (${initParam.releaseDate})</div> 
        </div>                   
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.mobile-1.4.5.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jtsage-datebox-4.1.1.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot.time-0.8.3.min.js"></script>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot.resize-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot.tooltip-0.8.5.min.js"></script>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/wave.js?v=${initParam.releaseNumber}"></script>
        <script type="text/javascript">
            jlab.wave.mygetUrl = '${fn:escapeXml(mygetUrl)}';
        </script>
    </body>
</html>
