
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, HelpCircle, Phone, ChevronRight, Mail, MessageSquare } from "lucide-react";

const InformationSection = () => {
  const faqData = [
    {
      question: "How many vehicles can I register?",
      answer: "• Free users: 1 vehicle\n• Pro users: Up to 5 vehicles\n• Team users: More than 5 vehicles"
    },
    {
      question: "What reminders will I receive?",
      answer: "You'll get notifications 1 day, 1 week, 2, 3, and 4 weeks before document expiry."
    },
    {
      question: "What types of notifications are supported?",
      answer: "Push, Email, and SMS (depending on your plan and preferences)."
    },
    {
      question: "Can I change my reminder preferences?",
      answer: "Yes, you can adjust notification channels in your settings at any time."
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Information</CardTitle>
        <CardDescription>Access privacy policy, help, and contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Privacy Policy Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-600" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Policy
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm text-gray-600 leading-relaxed">
              <p>
                We value your privacy. DriveDue only collects necessary information, such as your name, email, phone number, and vehicle document details, to provide timely reminders. Your data is securely stored and never shared with third parties. Notifications are sent based on your selected preferences. By using the app, you agree to our data use policy.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Help & FAQ Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-4 w-4 text-gray-600" />
                <span>Help & FAQ</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Help & FAQ
              </DialogTitle>
            </DialogHeader>
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </DialogContent>
        </Dialog>

        {/* Contact Us Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between h-auto p-3"
            >
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-600" />
                <span>Contact Us</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Us
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Need support or have a question?</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">drivedue.company@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">WhatsApp: +234 701 297 5251</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">We're here to help!</p>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InformationSection;
