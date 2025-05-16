import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { ImagePair } from "./PortfolioFormTypes";
import { format } from "date-fns";

interface PortfolioFormPreviewProps {
  title: string;
  description: string;
  imageUrl: string | undefined;
  featured: boolean;
  status: string;
  serviceId: any; // Allow any type for serviceId
  serviceName: string;
  date: Date;
  location: string | undefined;
  projectDuration: string | undefined;
  difficultyLevel: string | undefined;
  imagePairs: ImagePair[];
  clientTestimonial: {
    clientName: string | undefined;
    comment: string | undefined;
    displayPermission: boolean;
  };
}

export const PortfolioFormPreview: React.FC<PortfolioFormPreviewProps> = ({
  title,
  description,
  imageUrl,
  featured,
  status,
  serviceName,
  date,
  location,
  projectDuration,
  difficultyLevel,
  imagePairs,
  clientTestimonial,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Preview</CardTitle>
        <CardDescription>
          Preview how your portfolio item will appear
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="rounded-lg overflow-hidden border">
            <div className="relative h-64 bg-gray-100">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Preview+Image";
                  }}
                />
              ) : imagePairs[0]?.after ? (
                <img 
                  src={imagePairs[0].after} 
                  alt={title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Preview+Image";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-300" />
                </div>
              )}
              
              {featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500">Featured</Badge>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title || "Project Title"}</h2>
                <Badge variant="outline" className={status === "Published" 
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
                }>
                  {status}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                {serviceName && (
                  <div>
                    <i className="fas fa-tag mr-1"></i> {serviceName}
                  </div>
                )}
                {location && (
                  <div>
                    <i className="fas fa-map-marker-alt mr-1"></i> {location}
                  </div>
                )}
                {date && (
                  <div>
                    <i className="fas fa-calendar mr-1"></i> {format(date, "MMM d, yyyy")}
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 whitespace-pre-line">
                {description || "Project description will appear here..."}
              </p>
              
              {(projectDuration || difficultyLevel) && (
                <div className="flex items-center space-x-4 text-sm">
                  {projectDuration && (
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                      <i className="fas fa-clock mr-1"></i> {projectDuration}
                    </div>
                  )}
                  {difficultyLevel && (
                    <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                      <i className="fas fa-chart-line mr-1"></i> {difficultyLevel} Difficulty
                    </div>
                  )}
                </div>
              )}
              
              {imagePairs.length > 0 && imagePairs[0].before && imagePairs[0].after && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Before & After</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="h-48 rounded-md overflow-hidden border">
                        <img 
                          src={imagePairs[0].before} 
                          alt="Before" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Before";
                          }}
                        />
                      </div>
                      <p className="text-center text-sm mt-1">Before</p>
                    </div>
                    <div>
                      <div className="h-48 rounded-md overflow-hidden border">
                        <img 
                          src={imagePairs[0].after} 
                          alt="After" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=After";
                          }}
                        />
                      </div>
                      <p className="text-center text-sm mt-1">After</p>
                    </div>
                  </div>
                  {imagePairs[0].caption && (
                    <p className="text-sm text-gray-500 mt-2 text-center">{imagePairs[0].caption}</p>
                  )}
                </div>
              )}
              
              {clientTestimonial.clientName && clientTestimonial.comment && clientTestimonial.displayPermission && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium mb-2">Client Testimonial</h3>
                  <blockquote className="italic text-gray-700">"{clientTestimonial.comment}"</blockquote>
                  <p className="text-right mt-2 text-sm font-medium">— {clientTestimonial.clientName}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>This is a preview of how your portfolio item will appear to visitors. The actual display may vary slightly based on your website's theme and layout.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioFormPreview;
