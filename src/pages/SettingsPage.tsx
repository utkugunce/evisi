import { useSettingsStore } from '../store/settingsStore';
import { Card } from '../components/common/Card';
import { Download, Upload, Trash2, Moon, Sun, Monitor } from 'lucide-react';
import { db } from '../services/database';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
    const { theme, setTheme } = useSettingsStore();

    const handleExport = async () => {
        try {
            const tasks = await db.table('tasks').toArray();
            const categories = await db.table('categories').toArray();
            const completions = await db.table('completions').toArray();

            const data = { tasks, categories, completions, exportedAt: new Date().toISOString() };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `evitakip-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Dışa aktarma başarısız: ' + (error as Error).message);
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (data.tasks) await db.table('tasks').bulkPut(data.tasks);
                if (data.categories) await db.table('categories').bulkPut(data.categories);
                if (data.completions) await db.table('completions').bulkPut(data.completions);

                alert('Veriler başarıyla içe aktarıldı!');
                window.location.reload();
            } catch (error) {
                alert('İçe aktarma başarısız: ' + (error as Error).message);
            }
        };
        input.click();
    };

    const handleReset = async () => {
        if (confirm('Tüm veriler silinecek. Bu işlem geri alınamaz. Emin misiniz?')) {
            if (confirm('Son kez soruyorum: TÜM VERİLER SİLİNECEK!')) {
                await db.delete();
                window.location.reload();
            }
        }
    };

    return (
        <div className={styles.page}>
            {/* Theme Settings */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>🎨 Tema</h2>
                <Card className={styles.themeCard}>
                    <div className={styles.themeOptions}>
                        <button
                            className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <Sun size={24} />
                            <span>Aydınlık</span>
                        </button>
                        <button
                            className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <Moon size={24} />
                            <span>Karanlık</span>
                        </button>
                        <button
                            className={`${styles.themeOption} ${theme === 'system' ? styles.active : ''}`}
                            onClick={() => setTheme('system')}
                        >
                            <Monitor size={24} />
                            <span>Sistem</span>
                        </button>
                    </div>
                </Card>
            </section>

            {/* Data Management */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>💾 Veri Yönetimi</h2>
                <div className={styles.dataActions}>
                    <Card className={styles.dataCard} onClick={handleExport} hoverable>
                        <Download size={24} className={styles.dataIcon} />
                        <div className={styles.dataInfo}>
                            <h3>Verileri Dışa Aktar</h3>
                            <p>Tüm görev ve geçmiş verilerini JSON olarak indirin</p>
                        </div>
                    </Card>

                    <Card className={styles.dataCard} onClick={handleImport} hoverable>
                        <Upload size={24} className={styles.dataIcon} />
                        <div className={styles.dataInfo}>
                            <h3>Verileri İçe Aktar</h3>
                            <p>Daha önce dışa aktarılan bir yedekten geri yükleyin</p>
                        </div>
                    </Card>

                    <Card className={`${styles.dataCard} ${styles.danger}`} onClick={handleReset} hoverable>
                        <Trash2 size={24} className={styles.dataIcon} />
                        <div className={styles.dataInfo}>
                            <h3>Tüm Verileri Sil</h3>
                            <p>Tüm görevler, kategoriler ve geçmiş silinecek</p>
                        </div>
                    </Card>
                </div>
            </section>

            {/* About */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>ℹ️ Hakkında</h2>
                <Card className={styles.aboutCard}>
                    <h3 className={styles.appName}>EviTakip</h3>
                    <p className={styles.version}>Sürüm 1.0.0</p>
                    <p className={styles.description}>
                        Ev işleri ve bakım görevlerinizi kolayca takip edin.
                        Offline çalışır, verileriniz cihazınızda güvende kalır.
                    </p>
                </Card>
            </section>
        </div>
    );
}
