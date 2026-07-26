/**
 * Knowledge Graph schema (architecture)
 *
 * Every topic knows:
 *   parentTopic, childTopics[], prerequisites[],
 *   relatedTopics[], examImportance, difficulty
 */
(function (global) {
  "use strict";

  function createKnowledgeNode(partial) {
    const p = partial || {};
    return {
      id: p.id || null,
      topic: p.topic || null,
      parentTopic: p.parentTopic || null,
      childTopics: Array.isArray(p.childTopics) ? p.childTopics : [],
      prerequisites: Array.isArray(p.prerequisites) ? p.prerequisites : [],
      relatedTopics: Array.isArray(p.relatedTopics) ? p.relatedTopics : [],
      examImportance: p.examImportance != null ? p.examImportance : null,
      difficulty: p.difficulty || null,

      // Optional curriculum anchors
      board: p.board || null,
      class: p.class || null,
      subject: p.subject || null,
      chapter: p.chapter || null,
      conceptId: p.conceptId || null
    };
  }

  function createKnowledgeGraph(partial) {
    const p = partial || {};
    return {
      nodes: Array.isArray(p.nodes) ? p.nodes.map(createKnowledgeNode) : [],
      edges: Array.isArray(p.edges) ? p.edges : [],
      rootTopicId: p.rootTopicId || null
    };
  }

  const KnowledgeGraph = {
    createNode: createKnowledgeNode,
    createGraph: createKnowledgeGraph,

    /** Architecture stub — no curriculum graph content yet */
    resolveForConcept: async function (concept) {
      const c = concept || {};
      const node = createKnowledgeNode({
        id: c.id || null,
        topic: c.topic || c.chapter || null,
        parentTopic: null,
        childTopics: [],
        prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
        relatedTopics: [],
        examImportance:
          c.examReadiness && c.examReadiness.boardWeightage != null
            ? c.examReadiness.boardWeightage
            : null,
        difficulty: c.difficulty || null,
        board: c.board || null,
        class: c.class || null,
        subject: c.subject || null,
        chapter: c.chapter || null,
        conceptId: c.id || null
      });
      return createKnowledgeGraph({
        nodes: [node],
        edges: [],
        rootTopicId: node.id
      });
    },

    /** Architecture stub */
    getPrerequisites: function (graph, topicId) {
      const g = graph || createKnowledgeGraph({});
      const node = g.nodes.find(function (n) {
        return n.id === topicId || n.topic === topicId;
      });
      return node ? node.prerequisites.slice() : [];
    }
  };

  global.KnowledgeGraphSchema = KnowledgeGraph;
})(window);
