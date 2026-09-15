import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

/*
 * ============================================================
 * WEB UI FOR THE PLAGIARISM DETECTION ENGINE
 * ============================================================
 *
 * A small browser front-end for Main.java, built entirely on
 * com.sun.net.httpserver.HttpServer (part of the standard JDK --
 * no servlet container, no external framework, nothing to
 * download).
 *
 * It does NOT change a single line of Main.java. It sits in the
 * same (default) package so it can call Main's package-private
 * static methods and nested classes directly, wires typed-in
 * submissions into Main.Document objects exactly the way
 * Main.main() wires up files read from disk, and then calls the
 * existing Main.generateReport(...) unmodified to build the
 * report.
 *
 * NOTE: this file is deliberately outside the "engine" the course
 * constraint (no java.util.*) applies to -- it is presentation /
 * request-handling glue, analogous to Main's own use of java.io
 * and java.nio.file for file access. It still avoids java.util
 * where it costs nothing to do so, for consistency with the rest
 * of the project.
 *
 * Run:
 *   javac Main.java WebServer.java
 *   java WebServer            (defaults to port 8080)
 *   java WebServer 9090       (custom port)
 *
 * Then open the printed URL in a browser.
 * ============================================================
 */
public class WebServer {

    static final String REPORT_FILE = "plagiarism_report.html";
    static final Object REPORT_LOCK = new Object(); // Main.generateReport() writes a fixed filename

    public static void main(String[] args) throws IOException {
        int port = 8080;
        if (args.length >= 1) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException ignored) {
                // fall back to default port
            }
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new HomeHandler());
        server.createContext("/analyze", new AnalyzeHandler());
        server.setExecutor(null); // sequential handling; fine for a class project demo
        server.start();

        System.out.println("======================================");
        System.out.println(" PLAGIARISM DETECTION ENGINE -- WEB UI");
        System.out.println("======================================");
        System.out.println("Listening on: http://localhost:" + port + "/");
        System.out.println("Press Ctrl+C to stop.");
    }

    // =========================================================
    // GET / -- the submission form
    // =========================================================

    static class HomeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }
            byte[] page = Pages.homePage().getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
            exchange.sendResponseHeaders(200, page.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(page);
            }
        }
    }

    // =========================================================
    // POST /analyze -- run Main's pipeline on the submitted text
    // =========================================================

    static class AnalyzeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            String body = readBody(exchange.getRequestBody());
            FormData form = FormData.parse(body);

            int count = parseIntOrDefault(form.get("docCount"), 0);

            Main.Document[] documents = new Main.Document[count];
            int used = 0;

            for (int i = 1; i <= count; i++) {
                String name = form.get("docName_" + i);
                String rawText = form.get("docText_" + i);

                if (rawText == null || rawText.trim().isEmpty()) {
                    continue; // skip blank submissions rather than crash the run
                }
                if (name == null || name.trim().isEmpty()) {
                    name = "Submission_" + i + ".txt";
                }

                String cleaned = Main.preprocess(rawText);
                Main.Document doc = new Main.Document(name, cleaned);
                Main.Fingerprint[] kgrams = Main.generateKGrams(cleaned);
                doc.fingerprints = Main.winnow(kgrams);
                documents[used++] = doc;
            }

            if (used < 2) {
                sendHtml(exchange, 400, Pages.errorPage(
                    "At least two non-empty submissions are required. "
                    + "Go back and fill in another submission."));
                return;
            }

            Main.Document[] finalDocuments = new Main.Document[used];
            System.arraycopy(documents, 0, finalDocuments, 0, used);

            String reportHtml;
            synchronized (REPORT_LOCK) {
                Main.generateReport(finalDocuments); // 100% original, unmodified logic
                reportHtml = new String(Files.readAllBytes(Paths.get(REPORT_FILE)), StandardCharsets.UTF_8);
            }

            sendHtml(exchange, 200, Pages.wrapReport(reportHtml));
        }
    }

    // =========================================================
    // Small helpers (deliberately not using java.util, to match
    // the rest of the project's style)
    // =========================================================

    private static String readBody(InputStream in) throws IOException {
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }

    private static int parseIntOrDefault(String s, int fallback) {
        if (s == null) return fallback;
        try {
            return Integer.parseInt(s.trim());
        } catch (NumberFormatException e) {
            return fallback;
        }
    }

    private static void sendHtml(HttpExchange exchange, int status, String html) throws IOException {
        byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    /** Minimal application/x-www-form-urlencoded parser: a growable array of (key, value) pairs. */
    static class FormData {
        private String[] keys = new String[16];
        private String[] values = new String[16];
        private int size = 0;

        static FormData parse(String body) {
            FormData form = new FormData();
            if (body == null || body.isEmpty()) return form;

            int start = 0;
            for (int i = 0; i <= body.length(); i++) {
                if (i == body.length() || body.charAt(i) == '&') {
                    String pair = body.substring(start, i);
                    start = i + 1;
                    if (pair.isEmpty()) continue;

                    int eq = pair.indexOf('=');
                    String rawKey = eq >= 0 ? pair.substring(0, eq) : pair;
                    String rawValue = eq >= 0 ? pair.substring(eq + 1) : "";
                    form.add(decode(rawKey), decode(rawValue));
                }
            }
            return form;
        }

        private static String decode(String s) {
            try {
                return URLDecoder.decode(s, "UTF-8");
            } catch (Exception e) {
                return s;
            }
        }

        private void add(String key, String value) {
            if (size == keys.length) {
                String[] biggerKeys = new String[keys.length * 2];
                String[] biggerValues = new String[values.length * 2];
                System.arraycopy(keys, 0, biggerKeys, 0, size);
                System.arraycopy(values, 0, biggerValues, 0, size);
                keys = biggerKeys;
                values = biggerValues;
            }
            keys[size] = key;
            values[size] = value;
            size++;
        }

        String get(String key) {
            for (int i = 0; i < size; i++) {
                if (keys[i].equals(key)) return values[i];
            }
            return null;
        }
    }
}
