import { useEffect, useState } from 'react';
import { useNetwork } from '@/shared/hooks/useNetwork';
import { useOfflineStore } from '@/shared/store/useOfflineStore';
import { createSale } from '@/features/sales/services/sale.service';
import { insertSaleLine } from '@/features/sales/services/saleLine.service';
import { useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';

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
    let successSales = 0;
    let successLines = 0;

    // 1. Sync pending sales (headers + their lines)
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
        successSales++;
      } catch (error) {
        console.error('Error syncing offline sale:', error);
      }
    }

    // 2. Sync lone lines (lines added to sales already in Supabase)
    // After step 1, any line remaining in pendingSaleLines is a "lone line"
    // (Note: we need to re-read the store state if multiple syncs could happen, 
    // but here we are in a single execution of syncData)
    // We use a copy since we'll be modifying the store
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
        successLines++;
      } catch (error) {
        console.error('Error syncing lone offline line:', error);
      }
    }

    if (successSales > 0 || successLines > 0) {
      sileo.success({ 
        title: 'Sincronización completada',
        description: `${successSales} ventas y ${successLines} artículos enviados.`
      });
      queryClient.invalidateQueries({ queryKey: ['Sale'] });
      queryClient.invalidateQueries({ queryKey: ['SaleLine'] });
    }
    
    setIsSyncing(false);
  };

  return null; // Invisible component
}
