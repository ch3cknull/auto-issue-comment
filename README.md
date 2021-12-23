# Auto Template For study-every-day

每天自动向 [study-every-day](https://github.com/cuixiaorui/study-every-day) 发送评论，内容为每日计划的模板。

这样只需要自己修改已添加的模板就行了

## 如何使用

0. fork本项目
1. 修改 [template.md](./template.md) 为自己适合的模板
2. 申请一个 token
3. 在 repo 的 Settings 的 Secrets 里添加新的 Secret
   1. 点击右上角 New repository secret
   2. Name 为 `GH_TOKEN`
   3. Value 为你申请到的 key

## 其他

1. 默认为早上 8 点 30 执行，如果有需要，可以在 `.github/workflows/action.yml` 修改 corn
   - 由于 GitHub Action 使用时区不同，和大陆时区差 16 个小时，需要在计算的时候做一个转换
   - 比如 16 对应国内 0 点，8 对应国内 16 点
   - GitHub Actions 可能会排队，所以不一定会立即执行
2. 如果在当天执行之前，已经在这一天 issue 下发过评论的话，自动模板会跳过
3. 找不到当天 issue 的话，也会跳过执行
