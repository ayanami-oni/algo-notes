# 广度优先搜索 BFS

## 基本概念

BFS（Breadth First Search）是一种逐层扩展的搜索算法，先访问当前节点的所有邻居，再依次访问邻居的邻居。

## 算法特点

- 使用**队列**
- 空间复杂度：$O(V)$
- **一定能找到最短路径**（无权图）
- 适合求解最短路径、层级遍历等问题

## 代码模板

```cpp
void bfs(int start) {
    queue<int> q;
    q.push(start);
    vis[start] = true;
    dist[start] = 0;

    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!vis[v]) {
                vis[v] = true;
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
}
```

## 经典应用

| 应用场景 | 说明 |
|---------|------|
| 最短路径 | 无权图单源最短路径 |
| 层级遍历 | 二叉树按层输出 |
| 拓扑排序 | Kahn 算法 |
|  Flood Fill | 图像填充、连通块标记 |

## 双端队列优化（0-1 BFS）

当边权只有 0 和 1 时，可以用双端队列优化：

```cpp
deque<int> dq;
dq.push_front(start);
while (!dq.empty()) {
    int u = dq.front(); dq.pop_front();
    for (auto [v, w] : adj[u]) {
        if (dist[v] > dist[u] + w) {
            dist[v] = dist[u] + w;
            if (w == 0) dq.push_front(v);
            else dq.push_back(v);
        }
    }
}
```
