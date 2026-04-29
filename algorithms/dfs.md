# 深度优先搜索 DFS

## 基本概念

DFS（Depth First Search）是一种用于遍历或搜索树/图的算法，其核心思想是：**尽可能深地探索分支，当节点所有边都被探索后，回溯到上一个节点**。

## 算法特点

- 使用**栈**（递归隐式使用系统栈）
- 空间复杂度较低：$O(h)$，$h$ 为树高
- 不一定能找到最短路径
- 适合求解所有解、连通性、拓扑排序等问题

## 代码模板

### 递归实现

```cpp
void dfs(int u) {
    vis[u] = true;
    for (int v : adj[u]) {
        if (!vis[v]) {
            dfs(v);
        }
    }
}
```

### 非递归实现（显式栈）

```cpp
void dfs(int start) {
    stack<int> st;
    st.push(start);
    vis[start] = true;

    while (!st.empty()) {
        int u = st.top(); st.pop();
        for (int v : adj[u]) {
            if (!vis[v]) {
                vis[v] = true;
                st.push(v);
            }
        }
    }
}
```

## 经典应用

| 应用场景 | 说明 |
|---------|------|
| 连通分量 | 统计图中连通块数量 |
| 迷宫问题 | 寻找从起点到终点的路径 |
| 全排列/组合 | 回溯法求解所有方案 |
| 树的遍历 | 前序、中序、后序遍历 |

## 回溯法框架

```cpp
void backtrack(路径, 选择列表) {
    if (满足结束条件) {
        记录结果;
        return;
    }
    for (选择 : 选择列表) {
        做选择;
        backtrack(路径, 新的选择列表);
        撤销选择;  // 回溯
    }
}
```
