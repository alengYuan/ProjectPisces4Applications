# Patchlog

This file is used to record bug fixes for this application.

## 1.0.2

-   Refined the exit logic within the main process's RMTC module to ensure reliable closure and reboot of the application. This prevents the process from hanging under specific edge cases during the cleanup phase.
-   Updated underlying dependencies to resolve identified security vulnerabilities.

## 1.0.1

-   Resolved a potential crash in the main process caused by incorrect handling of worker threads during metadata parsing for track files. This issue manifested sporadically under specific conditions due to thread pool mismanagement.
