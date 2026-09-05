---
layout: page
title: 归档
---

<script setup lang="ts">
import { data } from './archive.data'
import { computed } from 'vue'

const grouped = computed(() => {
  const m = new Map<string, typeof data>()
  for (const post of data) {
    const key = post.category || '未分类'
    if (!m.has(key)) m.set(key, [])
    m.get(key)!.push(post)
  }
  return Array.from(m.entries())
})
</script>

# 归档

<p>站内共 {{ data.length }} 篇文章，按主题分类如下。</p>

<div v-for="[cat, posts] in grouped" :key="cat" class="archive-group">
  <h2>{{ cat }} <span class="count">({{ posts.length }})</span></h2>
  <ul>
    <li v-for="post in posts" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span class="meta">{{ post.date }}</span>
    </li>
  </ul>
</div>

<style>
.archive-group { margin: 1.5rem 0 2.5rem; }
.archive-group h2 { border: none; margin-bottom: 0.6rem; font-size: 1.2rem; }
.archive-group .count { color: var(--vp-c-text-3); font-weight: 400; font-size: 0.9rem; }
.archive-group ul { list-style: none; padding: 0; margin: 0; }
.archive-group li { padding: 0.4rem 0; border-bottom: 1px solid var(--vp-c-divider); display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; }
.archive-group li a { color: var(--vp-c-text-1); }
.archive-group li .meta { color: var(--vp-c-text-3); font-size: 0.85rem; white-space: nowrap; }
</style>
