
import { MessageSquare } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next';

const NoChatSelected = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
        <div className="max-w-md text-center space-y-6">
            {/* Icon Display */}
            <div className="flex justify-center gap-4 mb-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce">
                    <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                </div>
            </div>
            {/* Welcoming Text */}
            <div className="mt-6">
                <h2 className="text-2xl font-bold text-white mb-2">{t('welcome')}</h2>
                <p className="text-white text-lg">{t('selectLanguage')}. {t('typeMessage')}</p>
            </div>
        </div>
    </div>
  )
}

export default NoChatSelected