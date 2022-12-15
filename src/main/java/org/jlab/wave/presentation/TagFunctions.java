package org.jlab.wave.presentation;

/**
 *
 * @author slominskir
 */
public class TagFunctions {

    public static String epics2webHost() {
        String host = System.getenv("EPICS_2_WEB_HOST");

        if(host == null) {
            host = "";
        }

        return host;
    }

    public static String myqueryHost() {
        String host = System.getenv("MYQUERY_HOST");

        if(host == null) {
            host = "";
        }

        return host;
    }
}
