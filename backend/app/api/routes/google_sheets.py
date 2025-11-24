from fastapi import APIRouter, HTTPException, Query
import httpx

router = APIRouter(tags=["google-sheets"])


@router.get("/google-sheets/export")
async def export_google_sheet(
    sheet_id: str = Query(..., description="Google Sheets ID"),
    gid: str = Query("0", description="Sheet GID"),
    format: str = Query("csv", description="Export format (csv, tsv)"),
):
    """
    Прокси для экспорта данных из Google Sheets.
    Обходит проблемы с CORS при загрузке данных из браузера.
    """
    urls = [
        f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format={format}&gid={gid}",
        f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:{format}&gid={gid}",
    ]

    async with httpx.AsyncClient(timeout=30.0) as client:
        for url in urls:
            try:
                response = await client.get(url, follow_redirects=True)
                
                if response.status_code == 200:
                    content = response.text
                    
                    # Проверяем, что получили валидные данные (не HTML)
                    if content and not (content.strip().startswith('<!DOCTYPE') or content.strip().startswith('<html')):
                        return {
                            "data": content,
                            "format": format,
                            "size": len(content),
                        }
                
                # Если 403 или 401 - таблица приватная
                if response.status_code in (403, 401):
                    raise HTTPException(
                        status_code=403,
                        detail={
                            "error": "Таблица недоступна",
                            "message": (
                                "Таблица не публичная. Убедитесь, что:\n"
                                "1. Таблица открыта в Google Sheets\n"
                                "2. Нажмите 'Настройки доступа' (Share)\n"
                                "3. Выберите 'Все, у кого есть ссылка'\n"
                                "4. Установите разрешение на 'Читатель'"
                            )
                        }
                    )
                
            except httpx.HTTPError as e:
                # Пробуем следующий URL
                continue
            except Exception as e:
                # Пробуем следующий URL
                continue
    
    raise HTTPException(
        status_code=400,
        detail={
            "error": "Не удалось загрузить данные",
            "message": (
                "Не удалось загрузить данные из Google Sheets.\n"
                "Возможные причины:\n"
                "1. Таблица не публичная\n"
                "2. Неправильный ID таблицы\n"
                "3. Проблемы с доступом к Google Sheets"
            )
        }
    )

