/*
 * ============================================================
 * PAGE TEMPLATES
 * ============================================================
 * Plain string-built HTML/CSS/JS, no templating engine, no
 * external assets -- everything the browser needs comes back in
 * a single response, consistent with WebServer's zero-dependency
 * approach.
 * ============================================================
 */
public class Pages {

    static String homePage() {
        return "<!DOCTYPE html>\n"
            + "<html><head><meta charset='utf-8'>"
            + "<meta name='viewport' content='width=device-width, initial-scale=1'>"
            + "<title>Plagiarism Detection Engine</title>"
            + STYLE
            + "</head><body>"
            + "<div class='wrap'>"
            + "<h1>Plagiarism Detection Engine</h1>"
            + "<p class='subtitle'>Academic submissions &middot; DSA Project 3</p>"

            + "<div class='pipeline'>"
            + pipelineStep("1", "Preprocess")
            + arrow()
            + pipelineStep("2", "Rabin-Karp")
            + arrow()
            + pipelineStep("3", "Winnowing")
            + arrow()
            + pipelineStep("4", "Candidate Pairs")
            + arrow()
            + pipelineStep("5", "Suffix Array")
            + arrow()
            + pipelineStep("6", "Kasai LCP")
            + arrow()
            + pipelineStep("7", "Report")
            + "</div>"

            + "<div class='card'>"
            + "<div class='card-head'>"
            + "<h2>Submissions</h2>"
            + "<button type='button' class='btn secondary' onclick='loadDemo()'>Load demo data</button>"
            + "</div>"
            + "<form id='analyzeForm' action='/analyze' method='POST'>"
            + "<div id='docList'></div>"
            + "<input type='hidden' id='docCount' name='docCount' value='0'>"
            + "<div class='form-actions'>"
            + "<button type='button' class='btn secondary' onclick='addDocument()'>+ Add submission</button>"
            + "<button type='submit' class='btn primary'>Run plagiarism check</button>"
            + "</div>"
            + "</form>"
            + "</div>"

            + "<p class='footnote'>Runs entirely on the original <code>Main.java</code> engine "
            + "(Rabin-Karp + winnowing shortlist, suffix array + Kasai LCP exact comparison) "
            + "through a small built-in HTTP server &mdash; no external libraries.</p>"
            + "</div>"
            + SCRIPT
            + "</body></html>";
    }

    static String errorPage(String message) {
        return "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Error</title>" + STYLE + "</head><body>"
            + "<div class='wrap'>"
            + "<h1>Plagiarism Detection Engine</h1>"
            + "<div class='card'><p class='error'>" + escape(message) + "</p>"
            + "<a class='btn primary' href='/'>&larr; Back</a></div>"
            + "</div></body></html>";
    }

    /** Wraps Main.generateReport()'s untouched HTML with a small nav bar so the round trip feels like one site. */
    static String wrapReport(String reportHtml) {
        String navBar = "<div class='report-nav'><a href='/'>&larr; New comparison</a></div>";
        int bodyIndex = reportHtml.indexOf("<body>");
        if (bodyIndex < 0) return navBar + reportHtml;
        int insertAt = bodyIndex + "<body>".length();
        return reportHtml.substring(0, insertAt)
            + navBar
            + STYLE_FOR_REPORT
            + reportHtml.substring(insertAt);
    }

    private static String pipelineStep(String number, String label) {
        return "<div class='step'><span class='num'>" + number + "</span><span>" + label + "</span></div>";
    }

    private static String arrow() {
        return "<span class='step-arrow'>&rarr;</span>";
    }

    private static String escape(String s) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '<') sb.append("&lt;");
            else if (c == '>') sb.append("&gt;");
            else if (c == '&') sb.append("&amp;");
            else sb.append(c);
        }
        return sb.toString();
    }

    private static final String STYLE =
        "<style>"
        + "*{box-sizing:border-box;}"
        + "body{font-family:'Segoe UI',Calibri,Arial,sans-serif;margin:0;background:#f4f5fb;color:#1b1f3b;}"
        + ".wrap{max-width:920px;margin:0 auto;padding:2.5rem 1.5rem 4rem;}"
        + "h1{margin:0 0 .2rem;font-size:2rem;}"
        + ".subtitle{color:#676b8f;margin:0 0 1.5rem;}"
        + ".pipeline{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;background:#1b1f3b;"
        + "  padding:1rem 1.2rem;border-radius:10px;margin-bottom:1.5rem;}"
        + ".step{display:flex;align-items:center;gap:.5rem;color:#fff;font-size:.85rem;white-space:nowrap;}"
        + ".step .num{background:#ffb703;color:#1b1f3b;font-weight:bold;border-radius:50%;"
        + "  width:1.5rem;height:1.5rem;display:inline-flex;align-items:center;justify-content:center;font-size:.75rem;}"
        + ".step-arrow{color:#8a8fc9;}"
        + ".card{background:#fff;border:1px solid #e4e4f0;border-radius:12px;padding:1.5rem;"
        + "  box-shadow:0 2px 10px rgba(27,31,59,0.06);}"
        + ".card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.6rem;}"
        + ".card-head h2{margin:0;font-size:1.2rem;}"
        + ".doc-block{border:1px solid #e4e4f0;border-radius:10px;padding:1rem;margin-bottom:1rem;background:#fafafc;}"
        + ".doc-block-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem;}"
        + ".doc-block label{font-size:.8rem;color:#676b8f;display:block;margin-bottom:.25rem;}"
        + ".doc-block input[type=text]{width:100%;padding:.5rem;border:1px solid #d8d8e6;border-radius:6px;margin-bottom:.6rem;font-size:.9rem;}"
        + ".doc-block textarea{width:100%;min-height:120px;padding:.6rem;border:1px solid #d8d8e6;border-radius:6px;"
        + "  font-family:Consolas,monospace;font-size:.85rem;resize:vertical;}"
        + ".remove-btn{background:none;border:none;color:#c1121f;cursor:pointer;font-size:.8rem;}"
        + ".form-actions{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:.5rem;}"
        + ".btn{border:none;border-radius:8px;padding:.65rem 1.1rem;font-size:.9rem;cursor:pointer;font-weight:600;}"
        + ".btn.primary{background:#1b1f3b;color:#fff;}"
        + ".btn.primary:hover{background:#3a3f87;}"
        + ".btn.secondary{background:#eef0fb;color:#1b1f3b;}"
        + ".btn.secondary:hover{background:#e0e3f7;}"
        + ".footnote{color:#8a8fa0;font-size:.8rem;margin-top:1.5rem;line-height:1.5;}"
        + ".footnote code{background:#eee;padding:.1rem .35rem;border-radius:4px;}"
        + ".error{color:#c1121f;font-weight:600;margin-bottom:1rem;}"
        + "</style>";

    // Injected into the (unmodified) report page so the "back" link matches the site's look.
    private static final String STYLE_FOR_REPORT =
        "<style>"
        + ".report-nav{margin-bottom:1rem;}"
        + ".report-nav a{display:inline-block;background:#1b1f3b;color:#fff;text-decoration:none;"
        + "  padding:.5rem 1rem;border-radius:8px;font-family:Arial,sans-serif;font-size:.85rem;}"
        + ".report-nav a:hover{background:#3a3f87;}"
        + "</style>";

    private static final String SCRIPT =
        "<script>\n"
        + "var docCounter = 0;\n"
        + "function addDocument(name, text) {\n"
        + "  docCounter++;\n"
        + "  var container = document.getElementById('docList');\n"
        + "  var block = document.createElement('div');\n"
        + "  block.className = 'doc-block';\n"
        + "  block.id = 'block_' + docCounter;\n"
        + "  block.innerHTML =\n"
        + "    \"<div class='doc-block-head'>\" +\n"
        + "    \"<strong>Submission \" + docCounter + \"</strong>\" +\n"
        + "    \"<button type='button' class='remove-btn' onclick='removeDocument(\" + docCounter + \")'>remove</button>\" +\n"
        + "    \"</div>\" +\n"
        + "    \"<label>File / student name</label>\" +\n"
        + "    \"<input type='text' name='docName_\" + docCounter + \"' placeholder='e.g. StudentA.txt'>\" +\n"
        + "    \"<label>Submission text</label>\" +\n"
        + "    \"<textarea name='docText_\" + docCounter + \"' placeholder='Paste the submission text here...'></textarea>\";\n"
        + "  container.appendChild(block);\n"
        + "  if (name) block.querySelector(\"input[name='docName_\" + docCounter + \"']\").value = name;\n"
        + "  if (text) block.querySelector(\"textarea[name='docText_\" + docCounter + \"']\").value = text;\n"
        + "  document.getElementById('docCount').value = docCounter;\n"
        + "}\n"
        + "function removeDocument(id) {\n"
        + "  var block = document.getElementById('block_' + id);\n"
        + "  if (block) block.remove();\n"
        + "}\n"
        + "function clearDocuments() {\n"
        + "  document.getElementById('docList').innerHTML = '';\n"
        + "  docCounter = 0;\n"
        + "}\n"
        + "function loadDemo() {\n"
        + "  clearDocuments();\n"
        + "  addDocument('SubmissionA.txt',\n"
        + "    \"Dijkstra's algorithm finds the shortest path from a single source vertex to every other vertex in a weighted graph, provided all edge weights are non-negative. It works by maintaining a set of vertices whose shortest distance from the source is already known, and repeatedly selecting the unvisited vertex with the smallest tentative distance using a priority queue.\");\n"
        + "  addDocument('SubmissionB.txt',\n"
        + "    \"Dijkstra's algorithm finds the shortest path from a single source vertex to every other vertex in a weighted graph, provided all edge weights are non-negative. The algorithm maintains a set of vertices whose shortest distance from the source is already known, and repeatedly picks the unvisited vertex with the smallest tentative distance, typically using a priority queue for efficiency.\");\n"
        + "  addDocument('SubmissionC.txt',\n"
        + "    \"A trie stores a set of strings by breaking each one into individual characters and threading them along root-to-node paths, so that every string sharing a common prefix also shares the corresponding path through the tree.\");\n"
        + "}\n"
        + "window.onload = function() {\n"
        + "  addDocument();\n"
        + "  addDocument();\n"
        + "  document.getElementById('analyzeForm').addEventListener('submit', function() {\n"
        + "    document.getElementById('docCount').value = docCounter;\n"
        + "  });\n"
        + "};\n"
        + "</script>";
}
