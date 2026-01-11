# Patchlog

This file is used to record bug fixes for this application.

## 1.0.1

-   Resolved a potential crash in the main process caused by incorrect handling of worker threads during metadata parsing for track files. This issue manifested sporadically under specific conditions due to thread pool mismanagement.
