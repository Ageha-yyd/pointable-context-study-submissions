# Pointable Context study submissions

This public repository accepts encrypted Pointable Context study-v2 result envelopes only.

本公开仓库只接收 Pointable Context study-v2 的加密结果 envelope。

## Privacy boundary / 隐私边界

- A submission must be one new `submissions/v2/submission-<token>.pcstudy` file.
- The envelope is encrypted locally with AES-256-GCM; its content key is wrapped with the organizer's RSA-OAEP-SHA256 public key.
- Do not submit raw Chat, selected text, source files, screenshots, names, email addresses, configuration values, or unencrypted result folders.
- GitHub displays the submitting account and Pull Request. Content encryption is pseudonymization, not GitHub-account anonymity.
- The validation workflow checks only the envelope shape, size, filename, and digest. It never decrypts or executes participant content and receives no repository secrets.

- 每次提交只能新增一个 `submissions/v2/submission-<token>.pcstudy` 文件。
- 结果先在本地用 AES-256-GCM 加密，内容密钥再由组织者的 RSA-OAEP-SHA256 公钥封装。
- 不要提交原始 Chat、选中文字、源文件、截图、姓名、邮箱、配置值或未加密结果目录。
- GitHub 会显示提交账号和 Pull Request；内容加密不等于 GitHub 账号匿名。
- 自动检查只验证 envelope 的结构、大小、文件名与摘要，不解密、不执行参与者内容，也不接收仓库 secrets。

## Submission / 提交

Use only the frozen participant package and organizer-supplied public key. Review the local result preview, explicitly confirm encryption, run the required dry-run, and only then create the Pull Request.

必须使用冻结的参与者实验包和组织者提供的公钥。先查看本地结果预览、明确确认加密、完成 dry-run，之后才能创建 Pull Request。

Procedural contact / 流程联系：`yuanyd6@mail2.sysu.edu.cn`

This repository does not itself mean that recruitment is open. Recruitment requires an immutable release whose manifest says exactly `approved_for_pilot_data_collection`.

本仓库的存在不代表已经开放招募。只有不可变发布包的 manifest 明确为 `approved_for_pilot_data_collection` 时，才允许开始正式 pilot。
