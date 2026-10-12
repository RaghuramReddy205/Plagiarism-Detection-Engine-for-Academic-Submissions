import java.io.*;
import java.nio.file.*;

/*
 * ============================================================
 * PLAGIARISM DETECTION ENGINE
 * ============================================================
 *
 * Algorithms:
 * 1. Text preprocessing
 * 2. Rabin-Karp rolling hash
 * 3. Winnowing
 * 4. Candidate pair detection
 * 5. Suffix Array - Prefix Doubling
 * 6. Kasai LCP Array
 * 7. Longest Common Substring detection
 * 8. Similarity calculation
 * 9. HTML report generation
 *
 * NOTE:
 * java.util.* collections are NOT used.
 * ============================================================
 */

public class Main {

    // ---------------------------------------------------------
    // CONFIGURATION
    // ---------------------------------------------------------

    static final int K_GRAM = 5;
    static final int WINDOW_SIZE = 4;

    // Minimum common substring length to report
    static final int LCP_THRESHOLD = 20;

    // Similarity above this value is considered suspicious
    static final double PLAGIARISM_THRESHOLD = 30.0;

    static final long BASE1 = 911382323L;
    static final long BASE2 = 972663749L;

    static final long MOD1 = 1000000007L;
    static final long MOD2 = 1000000009L;

    // =========================================================
    // DOCUMENT CLASS
    // =========================================================

    static class Document {

        String name;
        String text;

        Fingerprint[] fingerprints;

        Document(String name, String text) {
            this.name = name;
            this.text = text;
        }
    }

    // =========================================================
    // FINGERPRINT CLASS
    // =========================================================

    static class Fingerprint {

        long hash1;
        long hash2;
        int position;

        Fingerprint(long hash1, long hash2, int position) {
            this.hash1 = hash1;
            this.hash2 = hash2;
            this.position = position;
        }
    }

    // =========================================================
    // CUSTOM DYNAMIC ARRAY
    // =========================================================

    static class FingerprintArray {

        Fingerprint[] data;
        int size;

        FingerprintArray() {
            data = new Fingerprint[16];
            size = 0;
        }

        void add(Fingerprint value) {

            if (size == data.length) {

                Fingerprint[] temp = new Fingerprint[data.length * 2];

                for (int i = 0; i < data.length; i++) {
                    temp[i] = data[i];
                }

                data = temp;
            }

            data[size++] = value;
        }

        Fingerprint[] toArray() {

            Fingerprint[] result = new Fingerprint[size];

            for (int i = 0; i < size; i++) {
                result[i] = data[i];
            }

            return result;
        }
    }

    // =========================================================
    // TEXT PREPROCESSING
    // =========================================================

    static String preprocess(String text) {

        StringBuilder result = new StringBuilder();

        text = text.toLowerCase();

        for (int i = 0; i < text.length(); i++) {

            char c = text.charAt(i);

            if ((c >= 'a' && c <= 'z') ||
                    (c >= '0' && c <= '9')) {

                result.append(c);

            } else {

                result.append(' ');
            }
        }

        return normalizeSpaces(result.toString());
    }

    static String normalizeSpaces(String text) {

        StringBuilder result = new StringBuilder();

        boolean previousSpace = true;

        for (int i = 0; i < text.length(); i++) {

            char c = text.charAt(i);

            if (c == ' ') {

                if (!previousSpace) {
                    result.append(' ');
                }

                previousSpace = true;

            } else {

                result.append(c);
                previousSpace = false;
            }
        }

        return result.toString().trim();
    }

    // =========================================================
    // RABIN-KARP ROLLING HASH
    // =========================================================

    static Fingerprint[] generateKGrams(String text) {

        FingerprintArray result = new FingerprintArray();

        if (text.length() < K_GRAM) {
            return result.toArray();
        }

        long hash1 = 0;
        long hash2 = 0;

        long power1 = 1;
        long power2 = 1;

        for (int i = 0; i < K_GRAM; i++) {

            hash1 = (hash1 * BASE1 + text.charAt(i))
                    % MOD1;

            hash2 = (hash2 * BASE2 + text.charAt(i))
                    % MOD2;

            if (i < K_GRAM - 1) {

                power1 = (power1 * BASE1) % MOD1;

                power2 = (power2 * BASE2) % MOD2;
            }
        }

        result.add(
                new Fingerprint(hash1, hash2, 0));

        for (int i = K_GRAM; i < text.length(); i++) {

            char oldChar = text.charAt(i - K_GRAM);

            char newChar = text.charAt(i);

            hash1 = (hash1
                    - (oldChar * power1) % MOD1
                    + MOD1)
                    % MOD1;

            hash1 = (hash1 * BASE1 + newChar)
                    % MOD1;

            hash2 = (hash2
                    - (oldChar * power2) % MOD2
                    + MOD2)
                    % MOD2;

            hash2 = (hash2 * BASE2 + newChar)
                    % MOD2;

            result.add(
                    new Fingerprint(
                            hash1,
                            hash2,
                            i - K_GRAM + 1));
        }

        return result.toArray();
    }

    // =========================================================
    // WINNOWING
    // =========================================================

    static Fingerprint[] winnow(Fingerprint[] fingerprints) {

        FingerprintArray selected = new FingerprintArray();

        if (fingerprints.length == 0) {
            return selected.toArray();
        }

        if (fingerprints.length <= WINDOW_SIZE) {

            Fingerprint min = fingerprints[0];

            for (int i = 1; i < fingerprints.length; i++) {

                if (fingerprints[i].hash1 < min.hash1) {
                    min = fingerprints[i];
                }
            }

            selected.add(min);

            return selected.toArray();
        }

        int previousPosition = -1;

        for (int i = 0; i <= fingerprints.length - WINDOW_SIZE; i++) {

            Fingerprint minimum = fingerprints[i];

            for (int j = i + 1; j < i + WINDOW_SIZE; j++) {

                if (fingerprints[j].hash1 < minimum.hash1) {

                    minimum = fingerprints[j];
                }
            }

            /*
             * Do not store the same selected
             * fingerprint repeatedly.
             */

            if (minimum.position != previousPosition) {

                selected.add(minimum);

                previousPosition = minimum.position;
            }
        }

        return selected.toArray();
    }

    // =========================================================
    // FINGERPRINT MATCHING
    // =========================================================

    static boolean fingerprintExists(
            Fingerprint[] a,
            Fingerprint target) {

        for (int i = 0; i < a.length; i++) {

            if (a[i].hash1 == target.hash1 &&
                    a[i].hash2 == target.hash2) {

                return true;
            }
        }

        return false;
    }

    static int commonFingerprintCount(
            Fingerprint[] a,
            Fingerprint[] b) {

        int count = 0;

        for (int i = 0; i < a.length; i++) {

            if (fingerprintExists(b, a[i])) {
                count++;
            }
        }

        return count;
    }

    // =========================================================
    // SUFFIX ARRAY
    // PREFIX DOUBLING IMPLEMENTATION
    // =========================================================

    static class SuffixArray {

        String text;

        int[] suffixArray;
        int[] rank;
        int[] tempRank;

        SuffixArray(String text) {

            this.text = text;

            build();
        }

        void build() {

            int n = text.length();

            suffixArray = new int[n];

            rank = new int[n];

            tempRank = new int[n];

            for (int i = 0; i < n; i++) {

                suffixArray[i] = i;

                rank[i] = text.charAt(i);
            }

            for (int k = 1; k < n; k *= 2) {

                sortSuffixes(n, k);

                tempRank[suffixArray[0]] = 0;

                for (int i = 1; i < n; i++) {

                    int current = suffixArray[i];

                    int previous = suffixArray[i - 1];

                    if (rank[current] != rank[previous]
                            ||
                            getSecondRank(
                                    current,
                                    k) != getSecondRank(
                                            previous,
                                            k)) {

                        tempRank[current] = tempRank[previous] + 1;

                    } else {

                        tempRank[current] = tempRank[previous];
                    }
                }

                for (int i = 0; i < n; i++) {

                    rank[i] = tempRank[i];
                }

                if (rank[suffixArray[n - 1]] == n - 1) {

                    break;
                }
            }
        }

        int getSecondRank(
                int index,
                int k) {

            if (index + k >= text.length()) {
                return -1;
            }

            return rank[index + k];
        }

        void sortSuffixes(
                int n,
                int k) {

            /*
             * Simple insertion sort for clarity.
             *
             * For the final project, this can be
             * replaced by counting/radix sort to
             * achieve O(n log n).
             */

            for (int i = 1; i < n; i++) {

                int current = suffixArray[i];

                int j = i - 1;

                while (j >= 0 &&
                        compareSuffix(
                                suffixArray[j],
                                current,
                                k) > 0) {

                    suffixArray[j + 1] = suffixArray[j];

                    j--;
                }

                suffixArray[j + 1] = current;
            }
        }

        int compareSuffix(
                int a,
                int b,
                int k) {

            if (rank[a] != rank[b]) {

                return rank[a] - rank[b];
            }

            return getSecondRank(a, k)
                    - getSecondRank(b, k);
        }
    }

    // =========================================================
    // KASAI LCP ARRAY
    // =========================================================

    static int[] buildLCP(
            String text,
            int[] suffixArray) {

        int n = text.length();

        int[] lcp = new int[n];

        int[] inverse = new int[n];

        for (int i = 0; i < n; i++) {

            inverse[suffixArray[i]] = i;
        }

        int k = 0;

        for (int i = 0; i < n; i++) {

            int rank = inverse[i];

            if (rank == n - 1) {

                k = 0;
                continue;
            }

            int j = suffixArray[rank + 1];

            while (i + k < n &&
                    j + k < n &&
                    text.charAt(i + k) == text.charAt(j + k)) {

                k++;
            }

            lcp[rank] = k;

            if (k > 0) {
                k--;
            }
        }

        return lcp;
    }

    // =========================================================
    // COMMON SUBSTRING RESULT
    // =========================================================

    static class Match {

        int length;

        String text;

        Match(int length, String text) {

            this.length = length;
            this.text = text;
        }
    }

    // =========================================================
    // COMBINE TWO DOCUMENTS FOR SUFFIX ARRAY
    // =========================================================

    static Match[] findCommonSubstrings(
            String text1,
            String text2) {

        String separator = "#";

        String combined = text1 + separator + text2;

        SuffixArray sa = new SuffixArray(combined);

        int[] lcp = buildLCP(
                combined,
                sa.suffixArray);

        MatchArray matches = new MatchArray();

        for (int i = 0; i < lcp.length; i++) {

            if (lcp[i] < LCP_THRESHOLD) {
                continue;
            }

            int pos1 = sa.suffixArray[i];

            int pos2 = sa.suffixArray[i + 1];

            boolean firstInText1 = pos1 < text1.length();

            boolean secondInText1 = pos2 < text1.length();

            /*
             * We only care about suffixes
             * coming from different documents.
             */

            if (firstInText1 != secondInText1) {

                int length = lcp[i];

                if (length > text1.length()) {
                    length = text1.length();
                }

                int remaining2 = combined.length()
                        - pos2;

                if (length > remaining2) {
                    length = remaining2;
                }

                String common = combined.substring(
                        pos1,
                        pos1 + length);

                matches.add(
                        new Match(
                                length,
                                common));
            }
        }

        return matches.toArray();
    }

    // =========================================================
    // CUSTOM MATCH ARRAY
    // =========================================================

    static class MatchArray {

        Match[] data;

        int size;

        MatchArray() {

            data = new Match[10];

            size = 0;
        }

        void add(Match m) {

            if (size == data.length) {

                Match[] temp = new Match[data.length * 2];

                for (int i = 0; i < data.length; i++) {

                    temp[i] = data[i];
                }

                data = temp;
            }

            data[size++] = m;
        }

        Match[] toArray() {

            Match[] result = new Match[size];

            for (int i = 0; i < size; i++) {

                result[i] = data[i];
            }

            return result;
        }
    }

    // =========================================================
    // SIMILARITY
    // =========================================================

    static double calculateSimilarity(
            Document a,
            Document b) {

        Fingerprint[] fa = a.fingerprints;

        Fingerprint[] fb = b.fingerprints;

        if (fa.length == 0 ||
                fb.length == 0) {

            return 0.0;
        }

        int common = commonFingerprintCount(
                fa,
                fb);

        int total = fa.length + fb.length
                - common;

        if (total == 0) {
            return 0.0;
        }

        return ((double) common / total)
                * 100.0;
    }

    // =========================================================
    // HTML ESCAPE
    // =========================================================

    static String escapeHTML(String text) {

        StringBuilder result = new StringBuilder();

        for (int i = 0; i < text.length(); i++) {

            char c = text.charAt(i);

            if (c == '<') {
                result.append("&lt;");
            }

            else if (c == '>') {
                result.append("&gt;");
            }

            else if (c == '&') {
                result.append("&amp;");
            }

            else {
                result.append(c);
            }
        }

        return result.toString();
    }

    // =========================================================
    // GENERATE HTML REPORT
    // =========================================================

    static void generateReport(
            Document[] documents)
            throws IOException {

        StringBuilder html = new StringBuilder();

        html.append(
                "<!DOCTYPE html>\n");

        html.append(
                "<html>\n<head>\n");

        html.append(
                "<meta charset='UTF-8'>\n");

        html.append(
                "<title>Plagiarism Detection Report</title>\n");

        html.append("<style>\n");

        html.append(
                "body{"
                        + "font-family:Arial;"
                        + "margin:40px;"
                        + "background:#f5f5f5;"
                        + "}");

        html.append(
                "h1{color:#333;}");

        html.append(
                ".card{"
                        + "background:white;"
                        + "padding:20px;"
                        + "margin:20px 0;"
                        + "border-radius:10px;"
                        + "box-shadow:0 2px 8px #ccc;"
                        + "}");

        html.append(
                ".high{color:red;font-weight:bold;}");

        html.append(
                ".low{color:green;font-weight:bold;}");

        html.append(
                ".medium{color:orange;font-weight:bold;}");

        html.append(
                ".common{"
                        + "background:yellow;"
                        + "padding:3px;"
                        + "}");

        html.append(
                "table{"
                        + "width:100%;"
                        + "border-collapse:collapse;"
                        + "}");

        html.append(
                "th,td{"
                        + "border:1px solid #ccc;"
                        + "padding:10px;"
                        + "text-align:left;"
                        + "}");

        html.append("</style>\n");

        html.append("</head>\n<body>\n");

        html.append(
                "<h1>Plagiarism Detection Report</h1>");

        html.append(
                "<p><b>Algorithm Pipeline:</b> "
                        + "Rabin-Karp → Winnowing → "
                        + "Suffix Array → LCP</p>");

        // -----------------------------------------------------
        // SUMMARY TABLE
        // -----------------------------------------------------

        html.append("<div class='card'>");

        html.append(
                "<h2>Comparison Summary</h2>");

        html.append("<table>");

        html.append(
                "<tr>"
                        + "<th>Document 1</th>"
                        + "<th>Document 2</th>"
                        + "<th>Similarity</th>"
                        + "<th>Status</th>"
                        + "</tr>");

        for (int i = 0; i < documents.length; i++) {

            for (int j = i + 1; j < documents.length; j++) {

                double similarity = calculateSimilarity(
                        documents[i],
                        documents[j]);

                String status;

                if (similarity >= 60) {

                    status = "HIGH";

                } else if (similarity >= 30) {

                    status = "MEDIUM";

                } else {

                    status = "LOW";
                }

                html.append("<tr>");

                html.append(
                        "<td>"
                                + escapeHTML(
                                        documents[i].name)
                                + "</td>");

                html.append(
                        "<td>"
                                + escapeHTML(
                                        documents[j].name)
                                + "</td>");

                html.append(
                        "<td>"
                                + String.format(
                                        "%.2f",
                                        similarity)
                                + "%</td>");

                html.append(
                        "<td>"
                                + status
                                + "</td>");

                html.append("</tr>");
            }
        }

        html.append("</table>");

        html.append("</div>");

        // -----------------------------------------------------
        // DETAILED COMPARISON
        // -----------------------------------------------------

        for (int i = 0; i < documents.length; i++) {

            for (int j = i + 1; j < documents.length; j++) {

                double similarity = calculateSimilarity(
                        documents[i],
                        documents[j]);

                if (similarity < PLAGIARISM_THRESHOLD) {

                    continue;
                }

                Match[] matches = findCommonSubstrings(
                        documents[i].text,
                        documents[j].text);

                html.append(
                        "<div class='card'>");

                html.append(
                        "<h2>"
                                + escapeHTML(
                                        documents[i].name)
                                + " ↔ "
                                + escapeHTML(
                                        documents[j].name)
                                + "</h2>");

                html.append(
                        "<p><b>Similarity:</b> "
                                + String.format(
                                        "%.2f",
                                        similarity)
                                + "%</p>");

                html.append(
                        "<p><b>Common passages:</b> "
                                + matches.length
                                + "</p>");

                html.append(
                        "<h3>Detected Common Passages</h3>");

                for (int m = 0; m < matches.length; m++) {

                    html.append(
                            "<p class='common'>");

                    html.append(
                            escapeHTML(
                                    matches[m].text));

                    html.append("</p>");
                }

                html.append("</div>");
            }
        }

        html.append(
                "</body></html>");

        Files.write(
                Paths.get(
                        "plagiarism_report.html"),
                html.toString().getBytes());

        System.out.println(
                "\nReport generated: "
                        + "plagiarism_report.html");
    }

    // =========================================================
    // READ FILE
    // =========================================================

    static String readFile(
            String fileName)
            throws IOException {

        StringBuilder result = new StringBuilder();

        BufferedReader reader = new BufferedReader(
                new FileReader(fileName));

        String line;

        while ((line = reader.readLine()) != null) {

            result.append(line);
            result.append('\n');
        }

        reader.close();

        return result.toString();
    }

    // =========================================================
    // MAIN
    // =========================================================

    public static void main(
            String[] args) {

        try {

            System.out.println(
                    "======================================");

            System.out.println(
                    " PLAGIARISM DETECTION ENGINE");

            System.out.println(
                    "======================================");

            /*
             * -------------------------------------------------
             * INPUT DIRECTORY
             * -------------------------------------------------
             *
             * Create:
             *
             * submissions/
             *
             * Put:
             *
             * student1.txt
             * student2.txt
             * student3.txt
             *
             * inside it.
             */

            Path directory = Paths.get("submissions");

            if (!Files.exists(directory)) {

                Files.createDirectory(
                        directory);

                System.out.println(
                        "\nCreated 'submissions' directory.");

                System.out.println(
                        "Put student .txt files inside it "
                                + "and run the program again.");

                return;
            }

            File folder = directory.toFile();

            File[] files = folder.listFiles();

            if (files == null ||
                    files.length < 2) {

                System.out.println(
                        "\nAt least two .txt files "
                                + "are required.");

                return;
            }

            // -------------------------------------------------
            // CREATE DOCUMENT ARRAY
            // -------------------------------------------------

            Document[] documents = new Document[files.length];

            int documentCount = 0;

            for (int i = 0; i < files.length; i++) {

                if (!files[i]
                        .getName()
                        .toLowerCase()
                        .endsWith(".txt")) {

                    continue;
                }

                String original = readFile(
                        files[i].getPath());

                String cleaned = preprocess(
                        original);

                Document doc = new Document(
                        files[i].getName(),
                        cleaned);

                // -------------------------------------------------
                // RABIN-KARP
                // -------------------------------------------------

                Fingerprint[] fingerprints = generateKGrams(
                        cleaned);

                // -------------------------------------------------
                // WINNOWING
                // -------------------------------------------------

                doc.fingerprints = winnow(
                        fingerprints);

                documents[documentCount++] = doc;

                System.out.println(
                        "\nProcessed: "
                                + files[i].getName());

                System.out.println(
                        "Original characters: "
                                + original.length());

                System.out.println(
                        "Cleaned characters: "
                                + cleaned.length());

                System.out.println(
                        "K-gram fingerprints: "
                                + fingerprints.length);

                System.out.println(
                        "Winnowed fingerprints: "
                                + doc.fingerprints.length);
            }

            // Resize document array

            Document[] finalDocuments = new Document[documentCount];

            for (int i = 0; i < documentCount; i++) {

                finalDocuments[i] = documents[i];
            }

            // -------------------------------------------------
            // COMPARE DOCUMENTS
            // -------------------------------------------------

            System.out.println(
                    "\n======================================");

            System.out.println(
                    " DOCUMENT COMPARISON");

            System.out.println(
                    "======================================");

            for (int i = 0; i < documentCount; i++) {

                for (int j = i + 1; j < documentCount; j++) {

                    double similarity = calculateSimilarity(
                            finalDocuments[i],
                            finalDocuments[j]);

                    System.out.println(
                            "\n"
                                    + finalDocuments[i].name
                                    + " <-> "
                                    + finalDocuments[j].name);

                    System.out.printf(
                            "Similarity: %.2f%%\n",
                            similarity);

                    if (similarity >= PLAGIARISM_THRESHOLD) {

                        System.out.println(
                                "STATUS: POSSIBLE PLAGIARISM");

                    } else {

                        System.out.println(
                                "STATUS: LOW SIMILARITY");
                    }
                }
            }

            // -------------------------------------------------
            // REPORT
            // -------------------------------------------------

            generateReport(
                    finalDocuments);

        } catch (Exception e) {

            System.out.println(
                    "Error: "
                            + e.getMessage());

            e.printStackTrace();
        }
    }
}