<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<!DOCTYPE html>
<html class="${param.print eq 'Y' ? 'print ' : ''}">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WAVE</title>
        <link rel="shortcut icon" href="${pageContext.request.contextPath}/resources/img/favicon.ico?v=${initParam.releaseNumber}"/>
    </head>
    <body>
    <p>X-Remote-User Header: <c:out value="${pageContext.request.getHeader('X-Remote-User')}"/></p>
    <p>Servlet Remote User: <c:out value="${pageContext.request.remoteUser}"/></p>
    </body>
</html>
