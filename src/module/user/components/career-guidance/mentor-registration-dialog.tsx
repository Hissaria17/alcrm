import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { careerMentorAPI } from "@/lib/api/career-guidance";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const domains = [
  "Accounting & Finance",
  "Audit & Assurance",
  "Tax & Compliance",
  "Business Consulting",
  "Risk Management",
  "Financial Planning",
  "Corporate Finance",
  "Investment Banking",
  "Data Analytics",
  "Technology & Systems",
  "Human Resources",
  "Operations Management",
  "Strategy & Planning",
  "Other"
];

interface MentorRegistrationDialogProps {
  children: React.ReactNode;
}

export function MentorRegistrationDialog({ children }: MentorRegistrationDialogProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    domain: "",
    experience_years: "",
    bio: ""
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to register as a mentor');
      return;
    }

    if (!formData.domain || !formData.experience_years || !formData.bio.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const experienceYears = parseInt(formData.experience_years);
    if (isNaN(experienceYears) || experienceYears < 1) {
      toast.error('Please enter a valid number of years of experience');
      return;
    }

    try {
      setIsLoading(true);
      await careerMentorAPI.registerMentor({
        user_id: user.id,
        domain: formData.domain,
        experience_years: experienceYears,
        bio: formData.bio.trim()
      });
      
      toast.success('Successfully registered as a mentor!');
      setIsOpen(false);
      setFormData({
        domain: "",
        experience_years: "",
        bio: ""
      });
    } catch (error) {
      console.error('Error registering mentor:', error);
      toast.error('Failed to register as mentor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#D32F2F]" />
            Become a Mentor
          </DialogTitle>
          <DialogDescription>
            Share your expertise and help others in their career journey. Fill out the form below to register as a mentor.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="domain" className="text-right">
              Domain *
            </Label>
            <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select your area of expertise" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="experience" className="text-right">
              Experience *
            </Label>
            <Input
              id="experience"
              type="number"
              min="1"
              placeholder="Years of experience"
              value={formData.experience_years}
              onChange={(e) => handleInputChange('experience_years', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="bio" className="text-right pt-2">
              Bio *
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your background, expertise, and what you can offer as a mentor..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="col-span-3 min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !user}
            className="bg-[#D32F2F] hover:bg-[#C62828]"
          >
            {isLoading ? 'Registering...' : 'Register as Mentor'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 