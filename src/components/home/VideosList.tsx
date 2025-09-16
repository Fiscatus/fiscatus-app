import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Video } from "@/hooks/useHomeData";

interface VideosListProps {
  videos: Video[];
}

export default function VideosList({ videos }: VideosListProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  if (videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tutoriais em Vídeo
          </h3>
          <p className="text-[15px] md:text-base text-gray-600 leading-7">
            Aprenda a usar o sistema com nossos tutoriais em vídeo
          </p>
        </div>
        
        <Card className="bg-gray-50 border border-gray-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum tutorial disponível
            </h4>
            <p className="text-gray-600 mb-4">
              Os tutoriais em vídeo estarão disponíveis em breve.
            </p>
            <Button variant="outline" onClick={() => window.open("/docs", "_blank")}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver documentação
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Tutoriais em Vídeo
          </h3>
          <p className="text-[15px] md:text-base text-gray-600 leading-7">
            Aprenda a usar o sistema com nossos tutoriais em vídeo
          </p>
        </div>

        <div className="space-y-4">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                <CardContent className="p-0">
                  <div className="md:flex">
                    {/* Thumbnail */}
                    <div className="relative h-48 md:h-32 md:w-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <Button
                        onClick={() => handlePlayVideo(video)}
                        size="lg"
                        className="bg-white/90 hover:bg-white text-gray-900 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Play className="w-6 h-6 mr-2" />
                        Assistir
                      </Button>
                      <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {video.duration}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="p-6 flex-1">
                      <div className="mb-2">
                        <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                          {video.category}
                        </Badge>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {video.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        Tutorial completo com passo a passo detalhado para dominar esta funcionalidade.
                      </p>

                      <Button
                        onClick={() => handlePlayVideo(video)}
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                      >
                        Assistir tutorial
                        <Play className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal de Vídeo */}
      <Dialog open={!!selectedVideo} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <Play className="w-16 h-16 text-gray-400 mx-auto" />
              <p className="text-gray-600">
                Player de vídeo será implementado aqui
              </p>
              <p className="text-sm text-gray-500">
                Duração: {selectedVideo?.duration}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
