/**
 * Academic Corpus & Internet Agency Index
 * Simulates deep academic repositories and internet agencies for live plagiarism matching.
 */

const ACADEMIC_AGENCIES = [
  {
    id: 'ieee',
    name: 'IEEE Xplore Digital Library',
    code: 'IEEE-XPLORE',
    badgeColor: '#006699',
    icon: 'cpu',
    domain: 'ieeexplore.ieee.org',
    description: 'Institute of Electrical and Electronics Engineers scientific research database.',
    reputation: 'Tier 1 Peer-Reviewed Conference & Journal Index',
    papers: [
      {
        id: 'ieee-01',
        title: 'Distributed Consensus and Byzantine Fault Tolerance in Scalable Blockchain Networks',
        authors: 'H. Zhang, K. Patel, L. Chen',
        published: 'IEEE Transactions on Parallel and Distributed Systems, 2024',
        doi: '10.1109/TPDS.2024.3129845',
        text: `Distributed consensus algorithms form the bedrock of resilient decentralized computing environments. In asynchronous network topologies, reaching consensus amidst Byzantine node failures requires protocols that ensure safety and liveness properties. Classical Practical Byzantine Fault Tolerance (PBFT) optimizes communication complexity from exponential states to polynomial order O(R squared) per transaction view change. The primary mechanism relies on a three-phase commit sequence: pre-prepare, prepare, and commit. During the pre-prepare phase, the primary validator broadcasts a sequence proposal. Replicas validate the digital signature and transition to the prepare state, verifying that two-thirds of active network participants agree on monotonic block height ordering. Suffix array indexing and rolling hash verification prove that message replication overhead scales linearly with respect to cluster cardinality when threshold cryptography signatures are amalgamated.`
      },
      {
        id: 'ieee-02',
        title: 'High-Throughput Cryptographic Hash Functions in Cloud Storage Deduplication',
        authors: 'M. Chandusha, R. Reddy, P. Manikanta',
        published: 'IEEE Cloud Computing Letters, 2025',
        doi: '10.1109/CCL.2025.9928120',
        text: `Data deduplication in enterprise cloud storage frameworks demands rapid fingerprinting of petabyte-scale file archives. Traditional cryptographic hashing functions like SHA-256 introduce substantial CPU throttling. By leveraging Rabin-Karp rolling hashing coupled with Winnowing chunk selection, storage appliances can select deterministic boundary anchors without inspecting full block payloads. Fingerprint matching over sliding windows bounds the maximum duplicate interval to window length plus k-gram token count, enabling millisecond candidate pair retrieval across distributed object stores.`
      }
    ]
  },
  {
    id: 'arxiv',
    name: 'arXiv Pre-print Repository (Cornell University)',
    code: 'ARXIV-CORNELL',
    badgeColor: '#b31b1b',
    icon: 'book-open',
    domain: 'arxiv.org',
    description: 'Open-access archive for 2+ million scholarly articles in physics, mathematics, and computer science.',
    reputation: 'Open Science & Machine Learning Research Archive',
    papers: [
      {
        id: 'arxiv-01',
        title: 'Attention Mechanisms and Transformer Architectures for Dense Mathematical Reasoning',
        authors: 'A. Vaswani, E. Thorne, N. Goldberg',
        published: 'arXiv:2311.08942v3 [cs.CL], 2024',
        doi: '10.48550/arXiv.2311.08942',
        text: `Transformer architectures have revolutionized natural language understanding through multi-head self-attention mechanisms. Rather than relying on recurrent recurrent neural sequences, self-attention maps queries, keys, and values across high-dimensional latent vectors. The scaled dot-product attention computes softmax compatibility scores divided by the square root of key dimensionality. When fine-tuned on symbolic reasoning corpora, attention heatmaps reveal sparse activation paths that correspond to algorithmic reduction steps. Residual normalization layers and positional sinusoidal encodings ensure gradient stability across ultra-deep backpropagation trajectories.`
      },
      {
        id: 'arxiv-02',
        title: 'Deep Reinforcement Learning in Stochastic Multi-Agent Routing Environments',
        authors: 'J. Mercer, S. Tanaka',
        published: 'arXiv:2402.14810v1 [cs.AI], 2024',
        doi: '10.48550/arXiv.2402.14810',
        text: `Multi-agent pathfinding in continuous state spaces encounters state explosion when agent density scales beyond threshold bounds. We present a centralized training with decentralized execution framework incorporating actor-critic policy gradients with shared spatial attention maps. Simulated benchmarks confirm a thirty-five percent drop in trajectory collisions while maintaining Pareto-optimal arrival latencies across warehouse grid simulations.`
      }
    ]
  },
  {
    id: 'acm',
    name: 'ACM Digital Library',
    code: 'ACM-DL',
    badgeColor: '#0085ca',
    icon: 'database',
    domain: 'dl.acm.org',
    description: 'Association for Computing Machinery flagship publications and proceedings repository.',
    reputation: 'Premier Computing Society Archive',
    papers: [
      {
        id: 'acm-01',
        title: 'Linear Time Longest Common Prefix Array Computation Using Kasai Algorithm and Suffix Trees',
        authors: 'T. Kasai, G. Lee, H. Arimura',
        published: 'ACM Journal on Experimental Algorithmics, Vol. 28, 2023',
        doi: '10.1145/3581290.3581298',
        text: `Suffix arrays provide a memory-compact alternative to suffix trees for full-text indexing and genome sequence alignment. To match the query efficiency of suffix trees, auxiliary Longest Common Prefix (LCP) information is critical. Kasai et al. introduced an elegant linear time O(n) algorithm that calculates LCP values using the inverse suffix array. Because the height of matching prefixes between consecutive lexicographical suffixes decreases by at most one upon dropping the initial character, the inner comparison counter rarely regresses. Combining prefix doubling suffix array sorting with Kasai LCP arrays achieves instantaneous discovery of maximal common substrings across academic document corpora.`
      }
    ]
  },
  {
    id: 'springer',
    name: 'Springer Nature & ScienceDirect',
    code: 'SPRINGER-NATURE',
    badgeColor: '#e05a10',
    icon: 'globe',
    domain: 'link.springer.com',
    description: 'Global scientific publisher containing over 13 million scientific documents and journals.',
    reputation: 'Global Peer-Reviewed Journal Publisher',
    papers: [
      {
        id: 'springer-01',
        title: 'Autonomous Navigation in Unmanned Aerial Systems using LiDAR Odometry and Extended Kalman Filters',
        authors: 'D. Hoffman, K. Reinhardt, V. Rao',
        published: 'Journal of Intelligent & Robotic Systems, Springer, 2024',
        doi: '10.1007/s10846-024-02091-x',
        text: `Unmanned aerial vehicles operating in GPS-denied indoor environments necessitate precise real-time pose estimation. Simultaneous Localization and Mapping (SLAM) supported by 3D LiDAR point clouds extracts geometric surfel landmarks. An Extended Kalman Filter (EKF) fuses inertial measurement unit high-frequency angular velocities with low-frequency point cloud scan matches. Error covariance drift remains strictly bounded within twelve centimeters over extended twenty-minute autonomous exploration runs in subterranean industrial tunnels.`
      }
    ]
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia Academic & Encyclopedia Corpus',
    code: 'WIKI-ACAD',
    badgeColor: '#4f5b66',
    icon: 'layers',
    domain: 'en.wikipedia.org',
    description: 'World-wide collaborative open knowledge encyclopedia database.',
    reputation: 'Public Open Access Knowledge Repository',
    papers: [
      {
        id: 'wiki-01',
        title: 'Operating System Concurrency: Mutex, Semaphores, and Deadlock Prevention Strategies',
        authors: 'Wikimedia Foundation Open Contributors',
        published: 'Wikipedia Academic Repository, 2025 Revision',
        doi: '10.5281/zenodo.wiki.os.2025',
        text: `In computer science, concurrency is the execution of multiple instruction sequences simultaneously. To prevent race conditions where threads concurrently mutate shared data, synchronization primitives such as mutual exclusion locks (mutexes) and counting semaphores are deployed. A counting semaphore maintains an integer counter tracking available resource permits: wait() decrements the count and blocks if non-positive, while signal() increments the count and awakens queued threads. Deadlock occurs when processes are blocked in a circular wait condition where each waits for a resource held by another. Coffman conditions formalize the four requirements for deadlock: mutual exclusion, hold and wait, no preemption, and circular wait.`
      }
    ]
  },
  {
    id: 'researchgate',
    name: 'ResearchGate Scientific Network',
    code: 'RESEARCHGATE',
    badgeColor: '#00ccbb',
    icon: 'share-2',
    domain: 'researchgate.net',
    description: 'European commercial social networking site for scientists and researchers to share papers.',
    reputation: 'Global Researcher Working Paper Network',
    papers: [
      {
        id: 'rg-01',
        title: 'Comparative Evaluation of Rabin-Karp vs KMP and Boyer-Moore in Plagiarism Detection Systems',
        authors: 'Dr. Chandusha, Team 14 Scholars',
        published: 'ResearchGate Technical Report #25CS2103E-14, 2026',
        doi: '10.13140/RG.2.2.14890.7712',
        text: `Comparative evaluation of string pattern matching algorithms reveals distinct operational tradeoffs in plagiarism detection engines. Knuth-Morris-Pratt (KMP) and Boyer-Moore excel at single pattern search with linear worst-case overhead. However, when screening candidate documents containing thousands of paragraphs against external databases, Rabin-Karp rolling hashing with Winnowing fingerprint selection outperforms discrete searches by amortizing hash calculations across all n-grams. Prefix doubling suffix arrays and Kasai longest common prefix evaluation provide asymptotic bounds for maximal contiguous duplicate detection.`
      }
    ]
  },
  {
    id: 'turnitin',
    name: 'Turnitin Global Academic Repository',
    code: 'TURNITIN-ARCHIVE',
    badgeColor: '#e11d48',
    icon: 'shield-alert',
    domain: 'turnitin.com/archive',
    description: 'Commercial student assignment archive containing 1.4+ billion student papers globally.',
    reputation: 'Global University Assignment Database',
    papers: [
      {
        id: 'turnitin-01',
        title: 'Student Submission Archive #991024: DSA-3 Academic Report Sample',
        authors: 'Anonymous University Submission',
        published: 'Turnitin Global Repository Index, Term 2025',
        doi: '10.turnitin.student.archive/25290090',
        text: `Academic plagiarism has become a significant challenge due to the rapid growth of digital learning platforms and the increasing number of student submissions. Manually comparing assignments is time-consuming, error-prone, and impractical for large classes. This project presents a Plagiarism Detection Engine for Academic Submissions that efficiently identifies near-duplicate passages using advanced string processing algorithms from the DSA-3 curriculum. The system is designed to provide accurate plagiarism detection while minimizing computational cost and false-positive matches.`
      }
    ]
  }
];

// Presets for student testing
const SAMPLE_PRESETS = [
  {
    id: 'sample-high',
    name: 'Sample A: High Plagiarism (Direct IEEE Xplore Match)',
    category: 'Critical Alert',
    badge: 'High Similarity (~85%)',
    description: 'Directly copied text from IEEE Transactions on Parallel and Distributed Systems regarding PBFT Byzantine Fault Tolerance.',
    text: `Distributed consensus algorithms form the bedrock of resilient decentralized computing environments. In asynchronous network topologies, reaching consensus amidst Byzantine node failures requires protocols that ensure safety and liveness properties. Classical Practical Byzantine Fault Tolerance (PBFT) optimizes communication complexity from exponential states to polynomial order O(R squared) per transaction view change. The primary mechanism relies on a three-phase commit sequence: pre-prepare, prepare, and commit. During the pre-prepare phase, the primary validator broadcasts a sequence proposal. Replicas validate the digital signature and transition to the prepare state, verifying that two-thirds of active network participants agree on monotonic block height ordering. Suffix array indexing and rolling hash verification prove that message replication overhead scales linearly.`
  },
  {
    id: 'sample-moderate',
    name: 'Sample B: Paraphrased Content (arXiv Attention Mechanisms)',
    category: 'Moderate Warning',
    badge: 'Moderate Similarity (~42%)',
    description: 'Mixed and paraphrased paragraphs regarding Transformer architectures and self-attention from arXiv.org.',
    text: `In modern deep learning architectures, transformer networks have revolutionized natural language understanding through multi-head self-attention mechanisms. Instead of processing text via sequential recurrent networks, self-attention maps query, key, and value vectors directly across high-dimensional spaces. We implemented custom tokenization where the scaled dot-product attention computes softmax compatibility scores divided by square root of key dimensionality. Residual normalization layers and positional sinusoidal encodings ensure gradient stability across ultra-deep backpropagation trajectories during model training iterations.`
  },
  {
    id: 'sample-clean',
    name: 'Sample C: Original Research Work (Safe Academic Submission)',
    category: 'Clean / Safe',
    badge: 'Original Submission (<10%)',
    description: 'Authentic novel writing on optimizing memory bounds for dual-hash sliding windows with zero direct plagiarism.',
    text: `Our experimental methodology focuses on reducing L1 cache miss rates during large-scale fingerprint comparisons. While traditional Winnowing implementations utilize circular buffers, our memory layout groups continuous 64-bit integer pairs into packed SIMD-aligned contiguous memory blocks. Benchmarks conducted on synthetic test corpora demonstrated an eighteen percent throughput acceleration compared to standard pointer-linked dynamically allocated nodes. The empirical results confirm that cache coherence plays a decisive role in high-density string similarity engines.`
  },
  {
    id: 'sample-wiki',
    name: 'Sample D: Encyclopedia Match (Wikipedia Concurrency)',
    category: 'High Alert',
    badge: 'Wikipedia Match (~68%)',
    description: 'Text lifted from Wikipedia Academic Operating Systems regarding Semaphores and Coffman Deadlock conditions.',
    text: `In computer science, concurrency is the execution of multiple instruction sequences simultaneously. To prevent race conditions where threads concurrently mutate shared data, synchronization primitives such as mutual exclusion locks (mutexes) and counting semaphores are deployed. A counting semaphore maintains an integer counter tracking available permits: wait() decrements count and blocks if non-positive, while signal() increments count and awakens queued threads. Deadlock occurs when processes are blocked in circular wait condition where each waits for a resource held by another. Coffman conditions formalize requirements for deadlock: mutual exclusion, hold and wait, no preemption, and circular wait.`
  }
];
