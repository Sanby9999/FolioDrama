#!/usr/bin/env python3
"""
從 Google Sheet 讀取劇單資料,轉成 Hugo 看得懂的 data file(data/dramas.json)。

驗證方式用 Application Default Credentials(ADC),本地端跟 CI 環境共用同一套程式碼:
- 本地開發:先執行 `gcloud auth application-default login` 授權自己的帳號,
  並確保這個 Google 帳號本身有被分享到該 Sheet(檢視者權限即可)。
- GitLab CI:GOOGLE_APPLICATION_CREDENTIALS 會由 WIF 產生的憑證設定檔提供,
  這支 script 完全不用改。
"""

import json
import os

import google.auth
from googleapiclient.discovery import build

# ---- 設定區,換成妳自己的值 ----
SHEET_ID = os.environ.get("SHEET_ID", "1T3uqkGqv922Md92ZAR6B4BUONRNy7QpFdsLBx6hQ6rA")
SHEET_TAB = os.environ.get("SHEET_TAB", "工作表1")  # 換成妳實際的分頁名稱
RANGE = f"{SHEET_TAB}!A2:I"  # 第一列是標題,從第二列開始讀,A~I 共 9 欄
OUTPUT_PATH = "data/dramas.json"

# 對應 Sheet 欄位順序:是否推薦、劇名、類型、男主角、女主角、劇情說明、觀看心得、OST、OST連結(YouTube)
COLUMNS = [
    "recommended",
    "title",
    "genre",
    "male_lead",
    "female_lead",
    "synopsis",
    "review",
    "ost",
    "ost_url",
]


def fetch_rows() -> list[list[str]]:
    """呼叫 Sheets API,拿回原始的二維陣列(每列一筆資料)。"""
    credentials, _ = google.auth.default(
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]
    )
    service = build("sheets", "v4", credentials=credentials)
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID, range=RANGE)
        .execute()
    )
    return result.get("values", [])


def rows_to_records(rows: list[list[str]]) -> list[dict]:
    """把每一列轉成 dict,並把「是否推薦」轉成布林值。"""
    records = []
    for row in rows:
        # 補齊缺的欄位,避免某列漏填、Sheets API 回傳的陣列較短時 index 出錯
        padded = row + [""] * (len(COLUMNS) - len(row))
        record = dict(zip(COLUMNS, padded))
        record["recommended"] = bool(record["recommended"].strip())
        records.append(record)
    return records


def main() -> None:
    rows = fetch_rows()
    records = rows_to_records(rows)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"寫入 {len(records)} 筆資料到 {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
