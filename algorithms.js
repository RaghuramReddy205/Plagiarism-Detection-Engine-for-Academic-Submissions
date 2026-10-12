/**
 * Plagiarism Detection Engine - Algorithmic Core
 * Faithful implementation of Main.java DSA-3 string algorithms:
 * 1. Preprocessing & Normalization
 * 2. Rabin-Karp Rolling Hash (Dual 64-bit Modulo)
 * 3. Winnowing (Fingerprinting via Sliding Windows)
 * 4. Suffix Array (Prefix Doubling)
 * 5. Kasai Longest Common Prefix (LCP) Array
 * 6. Maximal Substring Extraction & Highlight Mapping
 * 7. Multi-Source Similarity Scoring & Agency Ranking
 */

class PlagiarismEngine {
  constructor() {
    this.K_GRAM = 5;
    this.WINDOW_SIZE = 4;
    this.LCP_THRESHOLD = 15;
    this.PLAGIARISM_THRESHOLD = 30.0; // Over 30% considered suspicious per Main.java

    // Dual Modulo constants from Main.java
    this.BASE1 = 911382323n;
    this.BASE2 = 972663749n;
    this.MOD1 = 1000000007n;
    this.MOD2 = 1000000009n;
  }

  /**
   * Preprocess text: lowercase, retain alphanumeric, normalize whitespace
   * Corresponds to Main.preprocess() & Main.normalizeSpaces()
   */
  preprocess(text) {
    if (!text) return { cleanText: '', charMap: [] };

    let clean = '';
    const charMap = []; // Maps clean character index back to original character index

    const lower = text.toLowerCase();
    let prevSpace = true;

    for (let i = 0; i < lower.length; i++) {
      const c = lower[i];
      const isAlphaNum = (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9');

      if (isAlphaNum) {
        clean += c;
        charMap.push(i);
        prevSpace = false;
      } else {
        if (!prevSpace) {
          clean += ' ';
          charMap.push(i);
          prevSpace = true;
        }
      }
    }

    const trimmed = clean.trim();
    return {
      cleanText: trimmed,
      charMap: charMap.slice(0, trimmed.length)
    };
  }

  /**
   * Rabin-Karp Rolling Hash algorithm
   * Corresponds to Main.generateKGrams()
   */
  generateKGrams(text) {
    const fingerprints = [];
    const n = text.length;
    const k = this.K_GRAM;

    if (n < k) return fingerprints;

    let hash1 = 0n;
    let hash2 = 0n;
    let power1 = 1n;
    let power2 = 1n;

    // Compute hash for first window
    for (let i = 0; i < k; i++) {
      const charCode = BigInt(text.charCodeAt(i));
      hash1 = (hash1 * this.BASE1 + charCode) % this.MOD1;
      hash2 = (hash2 * this.BASE2 + charCode) % this.MOD2;

      if (i < k - 1) {
        power1 = (power1 * this.BASE1) % this.MOD1;
        power2 = (power2 * this.BASE2) % this.MOD2;
      }
    }

    fingerprints.push({
      hash1: hash1.toString(),
      hash2: hash2.toString(),
      h1Big: hash1,
      h2Big: hash2,
      position: 0,
      ngram: text.substring(0, k)
    });

    // Roll hash across text
    for (let i = k; i < n; i++) {
      const oldChar = BigInt(text.charCodeAt(i - k));
      const newChar = BigInt(text.charCodeAt(i));

      hash1 = (hash1 - (oldChar * power1) % this.MOD1 + this.MOD1) % this.MOD1;
      hash1 = (hash1 * this.BASE1 + newChar) % this.MOD1;

      hash2 = (hash2 - (oldChar * power2) % this.MOD2 + this.MOD2) % this.MOD2;
      hash2 = (hash2 * this.BASE2 + newChar) % this.MOD2;

      const pos = i - k + 1;
      fingerprints.push({
        hash1: hash1.toString(),
        hash2: hash2.toString(),
        h1Big: hash1,
        h2Big: hash2,
        position: pos,
        ngram: text.substring(pos, pos + k)
      });
    }

    return fingerprints;
  }

  /**
   * Winnowing algorithm: extracts representative fingerprints using sliding window
   * Corresponds to Main.winnow()
   */
  winnow(fingerprints) {
    const selected = [];
    const len = fingerprints.length;
    const w = this.WINDOW_SIZE;

    if (len === 0) return selected;

    if (len <= w) {
      let minFp = fingerprints[0];
      for (let i = 1; i < len; i++) {
        if (fingerprints[i].h1Big < minFp.h1Big) {
          minFp = fingerprints[i];
        }
      }
      selected.push(minFp);
      return selected;
    }

    let previousPosition = -1;

    for (let i = 0; i <= len - w; i++) {
      let minFp = fingerprints[i];
      for (let j = i + 1; j < i + w; j++) {
        if (fingerprints[j].h1Big < minFp.h1Big) {
          minFp = fingerprints[j];
        }
      }

      if (minFp.position !== previousPosition) {
        selected.push(minFp);
        previousPosition = minFp.position;
      }
    }

    return selected;
  }

  /**
   * Build Suffix Array using Prefix Doubling algorithm
   * Corresponds to Main.SuffixArray.build()
   */
  buildSuffixArray(text) {
    const n = text.length;
    const sa = new Array(n);
    let rank = new Array(n);
    const tempRank = new Array(n);

    for (let i = 0; i < n; i++) {
      sa[i] = i;
      rank[i] = text.charCodeAt(i);
    }

    for (let k = 1; k < n; k *= 2) {
      // Sort suffixes based on current rank and rank with offset k
      sa.sort((a, b) => {
        if (rank[a] !== rank[b]) return rank[a] - rank[b];
        const nextA = a + k < n ? rank[a + k] : -1;
        const nextB = b + k < n ? rank[b + k] : -1;
        return nextA - nextB;
      });

      tempRank[sa[0]] = 0;
      for (let i = 1; i < n; i++) {
        const curr = sa[i];
        const prev = sa[i - 1];

        const prevNext = prev + k < n ? rank[prev + k] : -1;
        const currNext = curr + k < n ? rank[curr + k] : -1;

        if (rank[curr] !== rank[prev] || currNext !== prevNext) {
          tempRank[curr] = tempRank[prev] + 1;
        } else {
          tempRank[curr] = tempRank[prev];
        }
      }

      for (let i = 0; i < n; i++) {
        rank[i] = tempRank[i];
      }

      if (rank[sa[n - 1]] === n - 1) break;
    }

    return sa;
  }

  /**
   * Compute Kasai Longest Common Prefix (LCP) Array in O(N) linear time
   * Corresponds to Main.KasaiLCP
   */
  buildKasaiLCP(text, suffixArray) {
    const n = text.length;
    const lcp = new Array(n).fill(0);
    const invSuff = new Array(n);

    for (let i = 0; i < n; i++) {
      invSuff[suffixArray[i]] = i;
    }

    let k = 0;
    for (let i = 0; i < n; i++) {
      if (invSuff[i] === n - 1) {
        k = 0;
        continue;
      }

      const j = suffixArray[invSuff[i] + 1];

      while (i + k < n && j + k < n && text[i + k] === text[j + k]) {
        k++;
      }

      lcp[invSuff[i]] = k;

      if (k > 0) {
        k--;
      }
    }

    return lcp;
  }

  /**
   * Find Maximal Common Substrings between two documents using combined Generalized String
   * Delimited by '#' to avoid cross-boundary false matches.
   */
  findCommonSubstrings(textA, textB, minLength = 15) {
    const delimiter = '#';
    const combined = textA + delimiter + textB;
    const splitPoint = textA.length;

    const sa = this.buildSuffixArray(combined);
    const lcp = this.buildKasaiLCP(combined, sa);

    const matches = [];
    const n = combined.length;

    for (let i = 0; i < n - 1; i++) {
      const length = lcp[i];
      if (length >= minLength) {
        const pos1 = sa[i];
        const pos2 = sa[i + 1];

        // Ensure one position is in textA and the other is in textB
        const isA1 = pos1 < splitPoint;
        const isA2 = pos2 < splitPoint;

        if (isA1 !== isA2) {
          const matchLen = Math.min(
            length,
            isA1 ? splitPoint - pos1 : n - pos1,
            isA2 ? splitPoint - pos2 : n - pos2
          );

          if (matchLen >= minLength) {
            const posInA = isA1 ? pos1 : pos2;
            const posInB = isA1 ? pos2 - splitPoint - 1 : pos1 - splitPoint - 1;
            const matchedString = combined.substring(pos1, pos1 + matchLen);

            // Avoid containing the delimiter
            if (!matchedString.includes(delimiter)) {
              matches.push({
                startA: posInA,
                endA: posInA + matchLen,
                startB: posInB,
                endB: posInB + matchLen,
                length: matchLen,
                content: matchedString
              });
            }
          }
        }
      }
    }

    // Merge overlapping or contiguous intervals in textA
    return this.consolidateMatches(matches);
  }

  consolidateMatches(matches) {
    if (matches.length === 0) return [];
    // Sort by startA
    matches.sort((a, b) => a.startA - b.startA);

    const consolidated = [];
    let current = { ...matches[0] };

    for (let i = 1; i < matches.length; i++) {
      const next = matches[i];
      if (next.startA <= current.endA) {
        current.endA = Math.max(current.endA, next.endA);
        current.length = current.endA - current.startA;
      } else {
        consolidated.push(current);
        current = { ...next };
      }
    }
    consolidated.push(current);
    return consolidated;
  }

  /**
   * Calculate Jaccard similarity and Winnowing overlap
   */
  calculateWinnowingSimilarity(winnowA, winnowB) {
    if (winnowA.length === 0 || winnowB.length === 0) return 0;

    const setB = new Set(winnowB.map(w => `${w.hash1}-${w.hash2}`));
    let intersection = 0;

    for (const w of winnowA) {
      if (setB.has(`${w.hash1}-${w.hash2}`)) {
        intersection++;
      }
    }

    const union = winnowA.length + winnowB.length - intersection;
    return union > 0 ? (intersection / union) * 100 : 0;
  }

  /**
   * Complete Document Comparison between student submission and a target paper
   */
  compareDocuments(studentOriginal, targetOriginal) {
    const prepStudent = this.preprocess(studentOriginal);
    const prepTarget = this.preprocess(targetOriginal);

    const sClean = prepStudent.cleanText;
    const tClean = prepTarget.cleanText;

    if (sClean.length === 0 || tClean.length === 0) {
      return {
        similarityScore: 0,
        winnowingSimilarity: 0,
        coverageRatio: 0,
        matchingSubstrings: [],
        highlightRangesStudent: [],
        highlightRangesTarget: [],
        kgramsCount: 0,
        fingerprintsCount: 0,
        commonFingerprints: 0
      };
    }

    // 1. Rabin-Karp & Winnowing
    const kgramsStudent = this.generateKGrams(sClean);
    const kgramsTarget = this.generateKGrams(tClean);

    const winnowStudent = this.winnow(kgramsStudent);
    const winnowTarget = this.winnow(kgramsTarget);

    const winnowScore = this.calculateWinnowingSimilarity(winnowStudent, winnowTarget);

    // Count shared fingerprints
    const setTarget = new Set(winnowTarget.map(w => `${w.hash1}-${w.hash2}`));
    let sharedCount = 0;
    for (const w of winnowStudent) {
      if (setTarget.has(`${w.hash1}-${w.hash2}`)) sharedCount++;
    }

    // 2. Suffix Array & Kasai LCP substring matching
    const commonMatches = this.findCommonSubstrings(sClean, tClean, this.LCP_THRESHOLD);

    // 3. Compute text coverage of student document
    let matchedCharsA = 0;
    for (const match of commonMatches) {
      matchedCharsA += match.length;
    }
    const coverageA = (matchedCharsA / Math.max(1, sClean.length)) * 100;

    // Composite similarity score: weighted combination of Fingerprints & LCP Substrings
    const compositeScore = Math.min(100, (coverageA * 0.65) + (winnowScore * 0.35));

    // Map matches back to original text character indices for highlighting
    const studentHighlights = commonMatches.map(m => {
      const origStart = prepStudent.charMap[m.startA] ?? 0;
      const origEnd = (prepStudent.charMap[Math.min(m.endA - 1, prepStudent.charMap.length - 1)] ?? 0) + 1;
      return {
        start: origStart,
        end: origEnd,
        length: origEnd - origStart,
        cleanSnippet: m.content
      };
    });

    const targetHighlights = commonMatches.map(m => {
      const origStart = prepTarget.charMap[m.startB] ?? 0;
      const origEnd = (prepTarget.charMap[Math.min(m.endB - 1, prepTarget.charMap.length - 1)] ?? 0) + 1;
      return {
        start: origStart,
        end: origEnd,
        length: origEnd - origStart,
        cleanSnippet: m.content
      };
    });

    return {
      similarityScore: parseFloat(compositeScore.toFixed(1)),
      winnowingSimilarity: parseFloat(winnowScore.toFixed(1)),
      coverageRatio: parseFloat(coverageA.toFixed(1)),
      matchingSubstrings: commonMatches,
      highlightRangesStudent: studentHighlights,
      highlightRangesTarget: targetHighlights,
      kgramsCount: kgramsStudent.length,
      fingerprintsCount: winnowStudent.length,
      commonFingerprints: sharedCount,
      studentCleanLength: sClean.length,
      targetCleanLength: tClean.length
    };
  }

  /**
   * Search internet agencies and rank which agency or site is most similar!
   * Fulfills core user requirement: "which agency or site will more similar"
   */
  searchInternetAgencies(studentText, agencies) {
    const startTime = performance.now();
    const agencyResults = [];

    for (const agency of agencies) {
      let highestPaperScore = 0;
      let topPaper = null;
      let topComparison = null;
      let aggregatedMatches = 0;

      for (const paper of agency.papers) {
        const comp = this.compareDocuments(studentText, paper.text);
        if (comp.similarityScore > highestPaperScore || !topPaper) {
          highestPaperScore = comp.similarityScore;
          topPaper = paper;
          topComparison = comp;
        }
        aggregatedMatches += comp.commonFingerprints;
      }

      agencyResults.push({
        agencyId: agency.id,
        agencyName: agency.name,
        code: agency.code,
        domain: agency.domain,
        badgeColor: agency.badgeColor,
        icon: agency.icon,
        description: agency.description,
        reputation: agency.reputation,
        similarityScore: highestPaperScore,
        matchedPaper: topPaper,
        comparison: topComparison,
        totalFingerprintMatches: aggregatedMatches
      });
    }

    // Sort descending by similarity score
    agencyResults.sort((a, b) => b.similarityScore - a.similarityScore);

    const mostSimilarAgency = agencyResults[0] || null;
    const overallPlagiarismScore = mostSimilarAgency ? mostSimilarAgency.similarityScore : 0;
    const executionDurationMs = (performance.now() - startTime).toFixed(1);

    // Risk Classification per DSA Project thresholds
    let riskLevel = 'Safe';
    let riskBadgeClass = 'safe';
    let riskDescription = 'Original submission. Within acceptable academic originality parameters.';

    if (overallPlagiarismScore >= this.PLAGIARISM_THRESHOLD) {
      riskLevel = 'Critical Alert';
      riskBadgeClass = 'danger';
      riskDescription = 'High risk of academic misconduct. Substantial verbatim or structural overlap detected.';
    } else if (overallPlagiarismScore >= 15.0) {
      riskLevel = 'Moderate Warning';
      riskBadgeClass = 'warning';
      riskDescription = 'Moderate similarity detected. Common academic phrasing or potential uncredited quotes.';
    }

    return {
      executionDurationMs,
      overallPlagiarismScore,
      riskLevel,
      riskBadgeClass,
      riskDescription,
      mostSimilarAgency,
      allAgenciesRanked: agencyResults
    };
  }
}

// Global instance
window.plagiarismEngine = new PlagiarismEngine();
