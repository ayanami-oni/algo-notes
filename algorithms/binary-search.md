# 二分查找

## 核心思想

在**有序数组**中，每次将搜索范围缩小一半，时间复杂度 $O(\log n)$。

## 标准模板

```cpp
int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

## 二分答案

当答案具有**单调性**时，可以用二分来求解：

```cpp
bool check(int mid) {
    // 判断 mid 是否满足条件
}

int binaryAnswer() {
    int left = minVal, right = maxVal, ans = -1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (check(mid)) {
            ans = mid;
            right = mid - 1;  // 或 left = mid + 1，取决于求最大还是最小
        } else {
            left = mid + 1;
        }
    }
    return ans;
}
```

## 常见应用

| 问题类型 | 说明 |
|---------|------|
| 查找元素 | 标准二分查找 |
| 查找左边界 | 第一个 ≥ target 的位置 |
| 查找右边界 | 最后一个 ≤ target 的位置 |
| 浮点二分 | 精度控制，如求方程根 |
| 二分答案 | 最大化最小值、最小化最大值 |

## 常见错误

1. **死循环**：`mid = (left + right) / 2` 在 `left = right - 1` 时可能无限循环
2. **边界错误**：`left <= right` vs `left < right`，根据场景选择
3. **溢出**：`mid = left + (right - left) / 2` 避免 `left + right` 溢出
