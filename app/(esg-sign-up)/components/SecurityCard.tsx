import { Shield } from "lucide-react";

export const SecurityCard = () => {
  return (
    <div className="bg-esg-dark-green/80 backdrop-blur-sm rounded-2xl p-6 text-white">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold">Secure</h3>
      </div>
      
      <p className="text-sm leading-relaxed opacity-90">
        Your data is protected with enterprise-grade security and encryption. 
        Access is role-based, ensuring only the right people see the right information.
      </p>
      
      {/* Indicator dots */}
      <div className="flex space-x-2 mt-6">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-white/40 rounded-full"></div>
        <div className="w-2 h-2 bg-white/40 rounded-full"></div>
      </div>
    </div>
  );
};