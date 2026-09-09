'use client';

import { useState, useEffect } from 'react';
import { Palette, CheckCircle, Crown } from 'lucide-react';
import api from '../../../lib/axios';
import { motion } from 'framer-motion';

export default function TemplateSelector() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/templates');
        setTemplates(res.data);
        if (res.data.length > 0) {
          setActiveTemplate(res.data[0].id); // Default to first
        }
      } catch (error) {
        console.error('Gagal mengambil template', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return <div className="animate-pulse h-20 bg-foreground/5 rounded-xl"></div>;
  }

  // Fallback if no templates in DB
  const displayTemplates = templates.length > 0 ? templates : [
    { id: 1, name: 'Minimalis', is_premium: false },
    { id: 2, name: 'Elegan', is_premium: true },
    { id: 3, name: 'Modern Dark', is_premium: true }
  ];

  return (
    <div className="space-y-4 mt-6">
      <h3 className="font-bold flex items-center gap-2 text-foreground/80">
        <Palette size={18} /> Tema Jadwal (PDF/Excel)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {displayTemplates.map((template) => {
          const isActive = activeTemplate === template.id || (activeTemplate === null && template.id === 1);
          
          return (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTemplate(template.id)}
              className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all relative overflow-hidden ${
                isActive 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'border-border/50 hover:border-border bg-background'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`font-semibold ${isActive ? 'text-primary' : ''}`}>
                  {template.name}
                </span>
                {template.is_premium && (
                  <Crown size={16} className="text-yellow-500" />
                )}
              </div>
              
              {isActive && (
                <CheckCircle size={20} className="absolute bottom-3 right-3 text-primary" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
