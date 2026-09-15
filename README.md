# Plagiarism Detection Engine — Web UI

A browser front-end for your `Main.java` engine. **`Main.java` is untouched** —
`WebServer.java` and `Pages.java` sit in the same (default) package and call
`Main`'s existing methods directly, then render `Main.generateReport(...)`'s
output straight into the browser. No external libraries: the server is built
entirely on `com.sun.net.httpserver.HttpServer`, part of the standard JDK.

## Files

- `Main.java` — your original engine, unmodified.
- `WebServer.java` — starts an HTTP server, serves the form, and on submit
  builds `Main.Document` objects from the typed-in text exactly the way
  `Main.main()` builds them from files, then calls `Main.generateReport(...)`.
- `Pages.java` — the HTML/CSS/JS for the form page and a small results wrapper.

## Run

```bash
javac Main.java WebServer.java Pages.java
java WebServer            # defaults to port 8080
java WebServer 9090       # or pick a port
```

Open the printed URL (e.g. `http://localhost:8080/`) in a browser.

## Using it

1. Click **"+ Add submission"** to add as many documents as you want to compare
   (starts with 2), or click **"Load demo data"** to pre-fill three sample
   submissions (two near-duplicates, one independent).
2. Give each one a name and paste in its text.
3. Click **"Run plagiarism check"**. You'll see the exact same report
   `Main.java` would generate from the CLI — pairwise similarity table,
   status labels, and highlighted common passages — rendered in the browser,
   with a link back to start a new comparison.

## What this does and doesn't change

- **Does not** touch any algorithm, threshold, or HTML in `Main.java`.
- **Does not** require multipart file upload — submissions are pasted as text,
  which keeps the server-side parsing simple (a hand-rolled
  `application/x-www-form-urlencoded` parser, no external form-parsing
  library needed).
- Runs single-threaded (`server.setExecutor(null)`) and writes
  `plagiarism_report.html` to the working directory on every request, same as
  the CLI — fine for local demoing, not meant for concurrent multi-user
  traffic without further work (see the analysis notes for what that would
  take).
