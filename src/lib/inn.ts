export const INN_DB: Record<string, string> = {
  '7701234567': 'ООО «Технологии»', '7707083893': 'ПАО Сбербанк',
  '7736207543': 'ПАО Газпром', '5010051523': 'ООО «Яндекс»',
  '7704340310': 'ООО «ВКонтакте»', '771234567890': 'ИП Никитина',
  '7728168971': 'ООО «МТС»', '9999000001': 'ООО «Рога и Копыта»',
};

export function resolveINN(inn: string): Promise<string | null> {
  return new Promise(r => setTimeout(() => r(INN_DB[inn] || null), 500));
}
