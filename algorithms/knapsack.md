# 背包问题

## 01 背包

每个物品只能选一次。

### 状态定义

`dp[i][j]`：前 $i$ 个物品，容量为 $j$ 时的最大价值。

### 状态转移

```
dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i])
```

### 空间优化（一维）

```cpp
for (int i = 1; i <= n; i++) {
    for (int j = V; j >= w[i]; j--) {  // 倒序！
        dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
    }
}
```

> **必须倒序**：防止同一个物品被重复选取。

## 完全背包

每个物品可以选无限次。

```cpp
for (int i = 1; i <= n; i++) {
    for (int j = w[i]; j <= V; j++) {  // 正序！
        dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
    }
}
```

> **正序**：允许同一个物品被多次选取。

## 多重背包

每个物品有数量限制 $c[i]$。

### 二进制优化

将 $c[i]$ 拆分为 $1, 2, 4, ..., 2^k, c[i] - 2^{k+1} + 1$，转化为 01 背包。

```cpp
for (int i = 1; i <= n; i++) {
    int num = c[i];
    for (int k = 1; num > 0; k <<= 1) {
        int use = min(k, num);
        for (int j = V; j >= use * w[i]; j--) {
            dp[j] = max(dp[j], dp[j - use * w[i]] + use * v[i]);
        }
        num -= use;
    }
}
```
