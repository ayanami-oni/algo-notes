# 引水入城（NOIP 2010 提高组）

## 题目描述

在一个遥远的国度，一侧是风景秀美的湖泊，另一侧则是漫无边际的沙漠。该国的行政区划十分特殊，刚好构成一个 $N$ 行 $M$ 列的矩形，其中每个格子都代表一座城市，每座城市都有一个海拔高度。

为了使居民们都尽可能饮用到清澈的湖水，现在要在某些城市建造水利设施。水利设施有两种：

- **蓄水厂**：利用水泵将湖泊中的水抽取到所在城市的蓄水池中。只有与湖泊毗邻的第 1 行的城市可以建造蓄水厂。
- **输水站**：通过输水管线利用高度落差，将湖水从高处向低处输送。一座城市能建造输水站的前提，是存在比它海拔更高且拥有公共边的相邻城市，已经建有水利设施。

由于第 $N$ 行的城市靠近沙漠，是该国的干旱区，所以要求其中的每座城市都建有水利设施。

## 输入输出

- 如果能满足要求，第一行输出 `1`，第二行输出最少建造几个蓄水厂
- 如果不能满足要求，第一行输出 `0`，第二行输出干旱区中不可能建有水利设施的城市数目

## 核心思路

### 关键性质：覆盖区间的连续性

从第 1 行某列 $j$ 出发，水流能到达第 $N$ 行的所有列构成一个**连续区间** $[L[j], R[j]]$。

> **直观理解**：水从山顶流到山脚，在山脚下形成一片连续的湿润区，不可能出现"中间干了两边湿"的情况。

### 算法步骤

1. **BFS 求覆盖区间**：对第 1 行每一列做 BFS，记录能到达第 $N$ 行的最左列 $L[j]$ 和最右列 $R[j]$
2. **判断可行性**：检查第 $N$ 行是否有未被覆盖的列
3. **贪心求最少蓄水厂**：用最少的区间覆盖 $[1, M]$

## 代码实现

```cpp
#include <iostream>
#include <cstring>
#include <queue>
#include <algorithm>
using namespace std;

int N, M;
int h[505][505];
bool vis[505][505];
int L[505], R[505];
bool covered[505];
int dx[] = {0, 0, 1, -1};
int dy[] = {1, -1, 0, 0};

void bfs(int startCol) {
    memset(vis, false, sizeof(vis));
    queue<pair<int, int>> q;
    q.push({1, startCol});
    vis[1][startCol] = true;
    L[startCol] = M + 1;
    R[startCol] = 0;

    while (!q.empty()) {
        int x = q.front().first;
        int y = q.front().second;
        q.pop();

        if (x == N) {
            L[startCol] = min(L[startCol], y);
            R[startCol] = max(R[startCol], y);
        }

        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d];
            int ny = y + dy[d];
            if (nx >= 1 && nx <= N && ny >= 1 && ny <= M
                && !vis[nx][ny] && h[nx][ny] < h[x][y]) {
                vis[nx][ny] = true;
                q.push({nx, ny});
            }
        }
    }
}

int main() {
    cin >> N >> M;
    for (int i = 1; i <= N; i++)
        for (int j = 1; j <= M; j++)
            cin >> h[i][j];

    for (int j = 1; j <= M; j++) {
        bfs(j);
        for (int k = L[j]; k <= R[j]; k++)
            covered[k] = true;
    }

    int uncovered = 0;
    for (int j = 1; j <= M; j++)
        if (!covered[j]) uncovered++;

    if (uncovered > 0) {
        cout << 0 << endl;
        cout << uncovered << endl;
    } else {
        int ans = 0;
        int pos = 1;
        while (pos <= M) {
            int maxR = 0;
            for (int j = 1; j <= M; j++) {
                if (L[j] <= pos && R[j] >= pos) {
                    maxR = max(maxR, R[j]);
                }
            }
            ans++;
            pos = maxR + 1;
        }
        cout << 1 << endl;
        cout << ans << endl;
    }
    return 0;
}
```

## 复杂度分析

| 指标 | 复杂度 |
|------|--------|
| 时间 | $O(N \times M^2)$ |
| 空间 | $O(N \times M)$ |

## 关键感悟

这道题的核心难点在于**连续区间性质**的发现。一旦证明了覆盖区间是连续的，问题就转化为经典的区间覆盖贪心问题。
