import { useEffect, useState } from 'react';
import { useNetwork } from '@/shared/hooks/useNetwork';
import { useOfflineStore } from '@/shared/store/useOfflineStore';
import { createSale } from '@/features/sales/services/sale.service';
import { insertSaleLine } from '@/features/sales/services/saleLine.service';
import { useQueryClient } from '@tanstack/react-query';
import { SyncModal } from '@/shared/components/SyncModal';

export function OfflineSyncManager() {
  const { isOnline } = useNetwork();
  const { pendingSales, pendingSaleLines, removePendingSale } = useOfflineStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOnline && (pendingSales.length > 0 || pendingSaleLines.length > 0) && !isSyncing) {
      syncData();
    }
  }, [isOnline, pendingSales.length, pendingSaleLines.length, isSyncing]);

  const syncData = async () => {
    setIsSyncing(true);

    for (const sale of pendingSales) {
      try {
        const realSale = await createSale({
          idPlace: sale.idPlace,
          dateSale: new Date(sale.dateSale)
        });

        const relatedLines = pendingSaleLines.filter(l => l.offlineId === sale.offlineId);
        for (const line of relatedLines) {
          await insertSaleLine({
            idSale: realSale.idSale,
            idCategory: line.idCategory,
            qty: line.qty,
            unitPrice: line.unitPrice,
            subtotal: line.subtotal,
            oweMoney: line.oweMoney,
            sinpe: line.sinpe
          });
        }
        removePendingSale(sale.offlineId);
      } catch (error) {
        console.error('Error syncing offline sale:', error);
      }
    }

    const remainingLines = [...useOfflineStore.getState().pendingSaleLines];
    for (const line of remainingLines) {
      try {
        await insertSaleLine({
          idSale: line.offlineId,
          idCategory: line.idCategory,
          qty: line.qty,
          unitPrice: line.unitPrice,
          subtotal: line.subtotal,
          oweMoney: line.oweMoney,
          sinpe: line.sinpe
        });
        useOfflineStore.getState().removePendingSaleLine(line.offlineId, line.idCategory, line.qty);
      } catch (error) {
        console.error('Error syncing offline line:', error);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['Sale'] });
    queryClient.invalidateQueries({ queryKey: ['SaleLine'] });

    setIsSyncing(false);
  };

  return <SyncModal open={isSyncing} />;
}
