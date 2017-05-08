<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>WAVE</title>
        <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/resources/css/wave.css?v=${initParam.releaseNumber}"/>       
    </head>
    <body>
        <div id="chrome">
            <div class="subpanel"> 
                <h1>WAVE (v${initParam.releaseNumber})</h1>
            </div>
            <div class="subpanel">
                <input type="text" id="pv-input" placeholder="PV Name"/>
                <button type="button" id="go-button">➜</button>
            </div>
        </div>        
        <div id="chart-holder"></div>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery-1.10.2.min.js"></script>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot.time-0.8.3.min.js"></script>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot.resize-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/wave.js?v=${initParam.releaseNumber}"></script>
        <script type="text/javascript">
            jlab.wave.mygetUrl = '${fn:escapeXml(mygetUrl)}';
        </script>
    </body>
</html>
