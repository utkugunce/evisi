import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CompletionRecord, Task } from '../types';

export const AI_MODELS = {
    GEMINI_PRO: 'gemini-1.5-flash',
};

export class AIService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.init(apiKey);
        }
    }

    init(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: AI_MODELS.GEMINI_PRO });
    }

    isInitialized(): boolean {
        return !!this.genAI;
    }

    async generateTaskSuggestions(context: {
        season?: string;
        weather?: string;
        timeOfDay?: string;
        existingTasks: Task[];
    }): Promise<{ title: string; description: string; categoryKeyword: string }[]> {
        if (!this.model) throw new Error('AI Service not initialized');

        const prompt = `
            Bir ev işleri takip uygulaması için, aşağıdaki bağlama uygun 3 adet pratik ev işi görevi öner.
            
            Bağlam:
            - Mevsim: ${context.season || 'Bilinmiyor'}
            - Saat: ${context.timeOfDay || 'Bilinmiyor'}
            - Mevcut Görev Sayısı: ${context.existingTasks.length}

            Lütfen yanıtı geçerli bir JSON formatında ver. Format tam olarak şöyle olmalı (başka metin ekleme):
            [
                {
                    "title": "Görev Başlığı",
                    "description": "Kısa açıklama",
                    "categoryKeyword": "Cleaning" (veya "Maintenance", "Kitchen" gibi genel bir kategori anahtar kelimesi)
                }
            ]
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            let jsonStr = text;

            // Try to find JSON array brackets
            const startIndex = text.indexOf('[');
            const endIndex = text.lastIndexOf(']');

            if (startIndex !== -1 && endIndex !== -1) {
                jsonStr = text.substring(startIndex, endIndex + 1);
            }

            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('AI Suggestion Error:', error);
            throw new Error(`Görev önerileri alınamadı: ${(error as Error).message}`);
        }
    }

    async analyzeTaskHistory(history: CompletionRecord[], tasks: Task[]): Promise<string> {
        if (!this.model) throw new Error('AI Service not initialized');

        if (history.length === 0) {
            return "Henüz analiz edilecek yeterli veri yok. Birkaç görev tamamladıktan sonra tekrar deneyin.";
        }

        // Prepare simplified history for analysis
        const historySummary = history.slice(0, 20).map(h => {
            const task = tasks.find(t => t.id === h.taskId);
            return task ? `${task.title} (${new Date(h.completedAt).toLocaleDateString()})` : null;
        }).filter(Boolean).join('\n');

        const prompt = `
            Aşağıdaki ev işi tamamlama geçmişine dayanarak kullanıcıya motive edici ve içgörü dolu kısa bir analiz yaz (maksimum 3 cümle).
            Kullanıcının alışkanlıklarını öv veya nazikçe tavsiye ver. Samimi ve yardımsever bir ton kullan.
            
            Geçmiş:
            ${historySummary}
        `;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('AI Analysis Error:', error);
            return "Analiz şu anda oluşturulamadı.";
        }
    }
}

export const aiService = new AIService();
