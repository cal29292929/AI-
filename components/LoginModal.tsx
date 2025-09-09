import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (service: string) => void;
  onClose: () => void;
}

// FIX: Changed logo type from React.ReactNode to React.ReactElement for better type safety with React.cloneElement.
type Service = {
    name: string;
    bgColor: string;
    hoverColor: string;
    // FIX: To fix the cloneElement type error, the 'logo' prop type has been made more specific.
    logo: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

const services: Service[] = [
    { name: 'X', bgColor: 'bg-black', hoverColor: 'hover:bg-gray-800', logo: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg> },
    { name: 'YouTube', bgColor: 'bg-red-600', hoverColor: 'hover:bg-red-700', logo: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M8.051 1.999a.768.768 0 0 0-.693.342A20 20 0 0 0 1.943 8a20 20 0 0 0 5.414 5.658.768.768 0 0 0 .693.342h.005a.768.768 0 0 0 .692-.342A20 20 0 0 0 14.058 8a20 20 0 0 0-5.414-5.658.768.768 0 0 0-.692-.342m-1.126 4.95c-.22.13-.283.432-.138.65l2.138 3.737a.4.4 0 0 0 .528.138l.608-.347a.4.4 0 0 0 .138-.528L8.4 8.219a.4.4 0 0 0-.528-.138z"/></svg> },
    { name: 'Qiita', bgColor: 'bg-lime-500', hoverColor: 'hover:bg-lime-600', logo: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M3.134 1.134c-1.334 0-1.334.2-1.334 1.334v11.064c0 1.134.2 1.334 1.334 1.334h9.732c1.134 0 1.334-.2 1.334-1.334V2.468c0-1.134-.2-1.334-1.334-1.334H3.134zm1.068 2.668H6.94v1.066H4.202V3.802zm0 2.934h1.866v1.066H4.202v-1.066zm0 2.932h1.866v1.066H4.202v-1.066zm2.934-2.932h4.664v1.066H7.136v-1.066zm0 2.932h4.664v1.066H7.136v-1.066zm0-5.866h4.664v1.066H7.136V3.802z"/></svg> },
    { name: 'Zenn', bgColor: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', logo: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 256 256"><path d="M211.47,44.53a12,12,0,0,0-17,0l-51,51-2.12,2.12-28.85,28.86-28.86,28.85-2.12,2.12-51,51a12,12,0,0,0,17,17l51-51,2.12-2.12,28.86-28.85,28.85-28.86,2.12-2.12,51-51A12,12,0,0,0,211.47,44.53Z"/></svg> },
];

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const handleAllow = () => {
        if (selectedService) {
            onLogin(selectedService.name);
        }
    };

    const handleBack = () => {
        setSelectedService(null);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
        >
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-sm p-8 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <h2 id="login-title" className="text-2xl font-bold text-indigo-400">
                        {selectedService ? '連携の確認' : 'サービス連携'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" aria-label="閉じる">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {selectedService ? (
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className={`p-4 rounded-full ${selectedService.bgColor}`}>
                                {React.cloneElement(selectedService.logo, { className: "h-10 w-10 text-white" })}
                            </div>
                        </div>
                        <p className="text-gray-300 text-lg mb-2">
                            AI News Aggregatorが
                        </p>
                        <p className="font-bold text-white text-xl mb-4">
                            {selectedService.name} アカウントへのアクセスを求めています
                        </p>
                        <p className="text-gray-400 text-sm mb-6">
                            これにより、お気に入りや検索履歴などの設定をアカウントに紐づけて保存できるようになります。(実際のログインは行われません)
                        </p>
                        <div className="flex flex-col gap-3">
                             <button
                                onClick={handleAllow}
                                className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors ${selectedService.bgColor} ${selectedService.hoverColor}`}
                            >
                                連携を許可する
                            </button>
                            <button
                                onClick={handleBack}
                                type="button"
                                className="w-full px-6 py-3 rounded-lg bg-gray-600/50 text-gray-300 hover:bg-gray-600 transition-colors"
                            >
                                戻る
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg font-semibold text-gray-300 mb-4 text-center">
                           設定を保存するために、<br />連携するサービスを選択してください。
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                            {services.map(service => (
                                <button
                                    key={service.name}
                                    onClick={() => setSelectedService(service)}
                                    className={`flex items-center justify-center gap-3 w-full text-white font-bold py-3 px-4 rounded-lg transition-colors ${service.bgColor} ${service.hoverColor}`}
                                >
                                    {service.logo}
                                    <span>{service.name} で続ける</span>
                                </button>
                            ))}
                        </div>
                         <div className="mt-6 flex justify-end">
                            <button
                                onClick={onClose}
                                type="button"
                                className="px-6 py-2 rounded-lg bg-gray-600/50 text-gray-300 hover:bg-gray-600 transition-colors"
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>
                )}
            </div>
             <style>{`
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};