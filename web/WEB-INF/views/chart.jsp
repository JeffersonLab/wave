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
        <h1>WAVE</h1>
        <div id="chart-holder"></div>
        <div id="version-block" title="${fn:escapeXml(initParam.releaseDate)}">v<c:out value="${initParam.releaseNumber}"/></div>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery-1.10.2.min.js"></script>        
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/jquery.flot.resize-0.8.3.min.js"></script>
        <script type="text/javascript" src="${pageContext.request.contextPath}/resources/js/wave.js?v=${initParam.releaseNumber}"></script>        
    </body>
</html>
