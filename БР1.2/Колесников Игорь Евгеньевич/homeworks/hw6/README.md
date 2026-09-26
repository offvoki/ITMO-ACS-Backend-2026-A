# ДЗ6: первый запуск автодеплоя

Workflow: [`.github/workflows/jobby-deploy.yml`](../../../../.github/workflows/jobby-deploy.yml). Он запускается при push в ветку `jobby-deploy` только в форке `offvoki/ITMO-ACS-Backend-2026-A`.

1. Сервер ЛР4 должен быть доступен по SSH. На нём нужны Docker Engine, Docker Compose plugin, Nginx с конфигурацией из `labs/lab4/nginx-jobby.conf`, `curl` и `openssl`. Пользователь для workflow — `root`.
2. Создайте отдельный SSH-ключ для GitHub Actions **без passphrase**: `ssh-keygen -t ed25519 -N '' -f ~/.ssh/jobby_gha -C jobby-github-actions`. Добавьте содержимое `~/.ssh/jobby_gha.pub` в `/root/.ssh/authorized_keys` сервера. Закрытый ключ не добавляйте в репозиторий.
3. Проверьте host key сервера по отпечатку, полученному на сервере командой `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`. После проверки сохраните строку `ssh-keyscan -H <IP>` для секрета `JOBBY_SSH_KNOWN_HOSTS`.
4. В своём GitHub-форке откройте **Settings → Secrets and variables → Actions → New repository secret** и добавьте:
   - `JOBBY_SSH_HOST` — IP или DNS-имя сервера;
   - `JOBBY_SSH_PRIVATE_KEY` — полный текст файла `~/.ssh/jobby_gha`;
   - `JOBBY_SSH_KNOWN_HOSTS` — проверенная строка host key сервера.
5. Из ветки с работами выполните `git push offvoki HEAD:jobby-deploy`. Следующие изменения этой ветки также запускают workflow. Пуш в ветку сдачи `codex/submit-kolesnikov-br12` автодеплой не запускает.
6. В GitHub откройте **Actions → Jobby deploy**. Успешный запуск должен пройти этапы `build` и `deploy`. Затем проверьте на сервере `docker compose -p jobby -f /opt/jobby/current/lab23/docker-compose.yml -f /opt/jobby/current/lab4/docker-compose.deploy.yml ps` и публичные `/health/{service}`.

Не публикуйте `.env.deploy`, закрытый SSH-ключ и реальные пароли. Если сервер ЛР4 удалён, сначала подготовьте новый сервер и Nginx по ЛР4, затем укажите новый адрес и ключ в секретах.
